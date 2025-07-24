import type { NextApiRequest, NextApiResponse } from 'next';
import { ScholarData, Publication } from '@/types';
import axios from 'axios';
import * as cheerio from 'cheerio'; // Use wildcard import for compatibility
import { rateLimit } from '@/utils/rateLimit';

// --- Rate Limiter: Max 5 requests per minute per token ---
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 10,
});

// --- Observer Pattern for scraping events ---
class ScraperObservable {
  private observers: ((event: string, data: any) => void)[] = [];

  subscribe(observer: (event: string, data: any) => void) {
    this.observers.push(observer);
  }

  unsubscribe(observer: (event: string, data: any) => void) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(event: string, data: any) {
    this.observers.forEach(observer => observer(event, data));
  }
}

// --- Scholar Scraper Class ---
class ScholarScraper {
  private observable: ScraperObservable;

  constructor() {
    this.observable = new ScraperObservable();
    this.observable.subscribe((event, data) => {
      console.log(`Scholar Scraper Event: ${event}`, data);
    });
  }

  async scrapeProfile(profileUrl: string): Promise<Partial<ScholarData>> {
    this.observable.notify('scraping_started', { profileUrl });

    try {
      // Ensure URL includes hl=en
      const url = new URL(profileUrl);
      if (!url.searchParams.has('hl')) url.searchParams.set('hl', 'en');

      // Fetch HTML with browser-like headers
      const response = await axios.get(url.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://scholar.google.com/',
        },
        timeout: 10000,
      });

      const html = response.data;

      // --- Validate HTML response ---
      if (!html) {
        throw new Error('No HTML content returned from Google Scholar');
      }

      if (html.includes('Our systems have detected unusual traffic')) {
        throw new Error('Blocked by Google Scholar (CAPTCHA triggered)');
      }

      let $;
      try {
        $ = cheerio.load(html);
      } catch (err) {
        throw new Error('Cheerio failed to parse HTML');
      }

      // --- Extract Name ---
      let name: string | undefined;
      try {
        name = $('.gsc_prf_in').first().text().trim();
      } catch (error) {
        console.error('Error extracting name:', error);
      }

      // --- Extract Publications ---
      const publications: Publication[] = [];
      try {
        $('.gsc_a_tr').each((_idx, element) => {
          const titleElement = $(element).find('.gsc_a_at');
          const title = titleElement.text().trim();
          if (!title) return;

          const url = titleElement.attr('href')
            ? `https://scholar.google.com${titleElement.attr('href')}`
            : undefined;

          const authors = $(element).find('.gs_gray').first().text().trim();
          const venueYear = $(element).find('.gs_gray').last().text().trim();
          const journalYear = venueYear.split(', ');
          const journal = journalYear[0] || undefined;
          const year = journalYear.length > 1 ? journalYear[1] : undefined;

          const citationsText = $(element).find('.gsc_a_ac').text().trim();
          const citations = citationsText !== '' ? parseInt(citationsText, 10) : 0;

          publications.push({
            title,
            url,
            authors,
            journal,
            year,
            citations,
          });
        });
      } catch (error) {
        console.error('Error extracting publications:', error);
      }

      // --- Extract Citation Metrics ---
      const citations = {
        total: 0,
        h_index: undefined as number | undefined,
        i10_index: undefined as number | undefined,
      };

      try {
        $('.gsc_rsb_std').each((idx, element) => {
          const value = parseInt($(element).text().trim(), 10);
          if (idx === 0) citations.total = isNaN(value) ? 0 : value;
          if (idx === 2) citations.h_index = isNaN(value) ? undefined : value;
          if (idx === 4) citations.i10_index = isNaN(value) ? undefined : value;
        });
      } catch (error) {
        console.error('Error extracting citations:', error);
      }

      // --- Extract Interests ---
      const interests: string[] = [];
      try {
        $('.gsc_prf_ila').each((_idx, element) => {
          const interest = $(element).text().trim();
          if (interest) interests.push(interest);
        });
      } catch (error) {
        console.error('Error extracting interests:', error);
      }

      // --- Fallback Extraction ---
      if (!name && publications.length === 0 && interests.length === 0) {
        name = $('title').text().replace(' - Google Scholar', '').trim();

        $('a').each((_idx, element) => {
          const href = $(element).attr('href');
          const text = $(element).text().trim();
          if (href?.includes('/citations?view_op=view_citation') && text) {
            publications.push({
              title: text,
              authors: '',
              url: `https://scholar.google.com${href}`,
            });
          }
        });
      }

      this.observable.notify('scraping_completed', {
        name,
        publicationsCount: publications.length,
        interestsCount: interests.length,
      });

      return {
        name: name || 'Scholar Profile',
        profileUrl,
        publications,
        citations: citations.total > 0 ? citations : undefined,
        interests,
      };
    } catch (error: any) {
      this.observable.notify('scraping_error', { error: error.message });
      throw new Error(`Failed to scrape profile: ${error.message}`);
    }
  }
}

// --- API Handler ---
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting
    await limiter.check(res, 5, 'scholar_api');

    const { profileUrl } = req.body;
    if (!profileUrl) {
      return res.status(400).json({ error: 'Profile URL is required' });
    }

    // Validate Google Scholar URL
    const urlRegex =
      /^https:\/\/scholar\.google\.(com|co\.[a-z]{2})\/(citations|scholar).*/i;
    if (!urlRegex.test(profileUrl)) {
      return res.status(400).json({ error: 'Invalid Google Scholar profile URL' });
    }

    console.log('Starting Google Scholar scraping for URL:', profileUrl);

    const scraper = new ScholarScraper();
    const scholarData = await scraper.scrapeProfile(profileUrl);

    if (
      !scholarData.name ||
      ((scholarData.publications?.length ?? 0) === 0 &&
        (scholarData.interests?.length ?? 0) === 0)
    ) {
      console.warn('Retrieved empty or minimal data from Google Scholar');
      return res.status(200).json({
        name: scholarData.name || 'Scholar Profile',
        profileUrl,
        publications: [],
        interests: [],
        message: 'Limited data could be retrieved',
      });
    }

    console.log('Successfully scraped Google Scholar data');
    return res.status(200).json(scholarData);
  } catch (error: any) {
    console.error('Error in Scholar API:', error);

    if (error.message === 'Rate limit exceeded') {
      return res
        .status(429)
        .json({ error: 'Too many requests. Please try again later.' });
    }

    return res.status(500).json({
      error: 'Failed to fetch scholar data',
      details: error.message,
      tip: 'Google Scholar may be blocking automated access. Try again later or with a different profile.',
    });
  }
}
