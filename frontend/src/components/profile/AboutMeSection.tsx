import React from 'react';

interface AboutMeSectionProps {
  aboutMe: string | null | undefined;
}

const AboutMeSection: React.FC<AboutMeSectionProps> = ({ aboutMe }) => {
  if (!aboutMe) {
    return null;
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-3">Über mich:</h2>
      <p className="text-muted-foreground whitespace-pre-wrap">{aboutMe}</p>
    </div>
  );
};

export default AboutMeSection;
