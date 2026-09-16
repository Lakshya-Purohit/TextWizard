import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getToolById } from '../tools/toolRegistry';

const SITE_URL = 'https://dev-wizard.lakhsyapurohit.online';
const DEFAULT_TITLE = 'DevWizard — Client-Side Developer Utility Suite';
const DEFAULT_DESC = 'DevWizard is a high-performance, 100% client-side developer utility suite. Format JSON/XML, decode JWTs, convert Base64/files, test RegEx, generate cryptographic hashes, and inspect text diffs locally with zero data leakage.';

export const SeoMeta = ({ toolId }) => {
  const location = useLocation();
  const tool = toolId ? getToolById(toolId) : null;

  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${location.pathname}`;
    const pageTitle = tool ? `${tool.name} — DevWizard` : DEFAULT_TITLE;
    const pageDesc = tool ? `${tool.description} Fast, secure, and 100% client-side in your browser.` : DEFAULT_DESC;

    // 1. Update Title
    document.title = pageTitle;

    // 2. Helper to set or update meta tag
    const setMeta = (selector, attr, val, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 3. Helper for link tags
    const setLink = (rel, href) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Standard Meta
    setMeta('meta[name="description"]', 'name', 'description', pageDesc);
    setLink('canonical', canonicalUrl);

    // OpenGraph
    setMeta('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', pageDesc);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'DevWizard');

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', pageDesc);

    // 4. Inject JSON-LD Structured Data
    const scriptId = 'devwizard-jsonld';
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const jsonLdData = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': tool ? `${tool.name} - DevWizard` : 'DevWizard Developer Suite',
        'url': canonicalUrl,
        'description': pageDesc,
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'author': {
          '@type': 'Person',
          'name': 'Lakshya Purohit',
          'url': 'https://www.lakhsyapurohit.online'
        }
      }
    ];

    if (tool && tool.faqs && tool.faqs.length > 0) {
      jsonLdData.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': tool.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      });
    }

    scriptEl.textContent = JSON.stringify(jsonLdData);

  }, [tool, location.pathname]);

  return null;
};

export default SeoMeta;
