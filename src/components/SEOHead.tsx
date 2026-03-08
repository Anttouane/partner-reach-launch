import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
}

const SEOHead = ({ title, description, ogImage }: SEOHeadProps) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "website", true);
    setMeta("og:url", window.location.href, true);
    if (ogImage) {
      setMeta("og:image", ogImage, true);
    }
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title, true);
    setMeta("twitter:description", description, true);

    return () => {
      document.title = "Partnery - Connectez créateurs et marques";
    };
  }, [title, description, ogImage]);

  return null;
};

export default SEOHead;
