import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface InterestsSectionProps {
  interests: string[];
}

const InterestsSection: React.FC<InterestsSectionProps> = ({ interests }) => {
  if (!interests || interests.length === 0) {
    return null;
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-3">Meine Interessen:</h2>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <Badge key={interest} variant="secondary">
            {interest}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default InterestsSection;
