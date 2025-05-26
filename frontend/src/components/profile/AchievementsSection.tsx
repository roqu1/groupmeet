import React from 'react';
import { Achievement } from '@/types/user';
import { Award, Users, Star, Flame } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AchievementsSectionProps {
  achievements: Achievement[];
}

const iconMap: { [key: string]: React.ElementType } = {
  Users: Users,
  Award: Award,
  Star: Star,
  Flame: Flame,
};

const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements }) => {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-4">Errungenschaften:</h2>
      <div className="flex flex-wrap gap-4">
        <TooltipProvider>
          {achievements.map((ach) => {
            const IconComponent = iconMap[ach.iconName] || Award;
            return (
              <Tooltip key={ach.name} delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center text-center p-2 rounded-md hover:bg-muted/50 transition-colors cursor-default">
                    <IconComponent className="h-10 w-10 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">{ach.name}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground border rounded-md shadow-lg p-2">
                  <p className="text-sm font-medium">{ach.name}</p>
                  <p className="text-xs text-muted-foreground">{ach.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default AchievementsSection;
