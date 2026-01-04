import { motion } from "framer-motion";

interface PortfolioItem {
  id: string;
  image_url: string;
  title?: string;
}

interface PortfolioPreviewProps {
  items: PortfolioItem[];
  maxItems?: number;
}

const PortfolioPreview = ({ items, maxItems = 3 }: PortfolioPreviewProps) => {
  if (items.length === 0) return null;

  const displayItems = items.slice(0, maxItems);
  const remaining = items.length - maxItems;

  return (
    <div className="flex gap-1.5 mt-2">
      {displayItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative w-12 h-12 rounded-md overflow-hidden ring-1 ring-border/50"
        >
          <img 
            src={item.image_url} 
            alt={item.title || "Portfolio"} 
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}
      {remaining > 0 && (
        <div className="w-12 h-12 rounded-md bg-muted/70 flex items-center justify-center text-xs font-medium text-muted-foreground">
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default PortfolioPreview;
