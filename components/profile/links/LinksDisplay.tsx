import { LinkItem } from "../LinksSection";

interface LinksDisplayProps {
  links: LinkItem[];
}

export function LinksDisplay({ links }: LinksDisplayProps) {
  return (
    <div>
      {links.length === 0 && <p>No links added yet.</p>}
      {/* Display links here */}
      {links.map((link, index) => (
        <div key={index} className="p-2 rounded-md">
          <strong>{link.type}:</strong> {link.details}
        </div>
      ))}
    </div>
  );
}
