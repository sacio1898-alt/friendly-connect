import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  schema?: Record<string, any>;
}

export default function SEOHead({ title, description, url, image = '/logo.jpg', type = 'website', schema }: SEOHeadProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta tags
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1');
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:site_name', 'ZupraMart', 'property');
    setMeta('og:locale', 'bn_BD', 'property');
    if (url) {
      setMeta('og:url', url, 'property');
      // Canonical link
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }
    const imgUrl = image ? (image.startsWith('http') ? image : `https://zupramart.netlify.app${image}`) : 'https://zupramart.netlify.app/logo.jpg';
    setMeta('og:image', imgUrl, 'property');
    setMeta('og:image:width', '1100', 'property');
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', title, 'name');
    setMeta('twitter:description', description, 'name');
    setMeta('twitter:image', imgUrl, 'name');

    // Schema.org JSON-LD
    if (schema) {
      let script = document.getElementById('schema-jsonld') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'schema-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }

    return () => {
      const s = document.getElementById('schema-jsonld');
      if (s) s.remove();
    };
  }, [title, description, url, image, type, schema]);

  return null;
}
