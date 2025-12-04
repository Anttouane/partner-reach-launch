import { Instagram, Youtube, Twitter, Linkedin, Globe, LucideIcon } from "lucide-react";

interface SocialLinksProps {
  instagram_url?: string | null;
  youtube_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
}

const SocialLink = ({ url, Icon }: { url: string | null | undefined; Icon: LucideIcon }) => {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-primary transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <Icon className="h-4 w-4" />
    </a>
  );
};

const SocialLinks = ({ instagram_url, youtube_url, twitter_url, linkedin_url, website_url }: SocialLinksProps) => {
  const hasLinks = instagram_url || youtube_url || twitter_url || linkedin_url || website_url;
  
  if (!hasLinks) return null;
  
  return (
    <div className="flex items-center gap-3">
      <SocialLink url={instagram_url} Icon={Instagram} />
      <SocialLink url={youtube_url} Icon={Youtube} />
      <SocialLink url={twitter_url} Icon={Twitter} />
      <SocialLink url={linkedin_url} Icon={Linkedin} />
      <SocialLink url={website_url} Icon={Globe} />
    </div>
  );
};

export default SocialLinks;
