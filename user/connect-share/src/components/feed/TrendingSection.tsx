import { TrendingUp } from 'lucide-react';

const trends = [
  { tag: '#TechMeetup2024', posts: '1.2K posts' },
  { tag: '#DesignTrends', posts: '856 posts' },
  { tag: '#StartupLife', posts: '642 posts' },
  { tag: '#Photography', posts: '2.1K posts' },
];

export function TrendingSection() {
  return (
    <div className="bg-card rounded-xl shadow-card p-4 mt-4">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Trending
      </h3>
      <div className="space-y-2.5">
        {trends.map(t => (
          <button key={t.tag} className="w-full text-left hover:bg-muted/50 rounded-lg px-2 py-1.5 transition-colors">
            <p className="text-sm font-semibold text-foreground">{t.tag}</p>
            <p className="text-xs text-muted-foreground">{t.posts}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
