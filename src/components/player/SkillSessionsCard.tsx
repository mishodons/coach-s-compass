import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkillSessionsCardProps {
  playerId: string;
}

interface SubcategoryCount {
  name: string;
  count: number;
}

export function SkillSessionsCard({ playerId }: SkillSessionsCardProps) {
  const [data, setData] = useState<SubcategoryCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Get all session_log_skill_items for this player's skill items
      const { data: logItems } = await supabase
        .from('session_log_skill_items')
        .select(`
          player_skill_items:player_skill_item_id(
            player_id,
            skill_items:skill_item_id(
              skill_subcategories:subcategory_id(name)
            )
          )
        `);

      // Filter by player and group by subcategory
      const counts: Record<string, number> = {};
      (logItems || []).forEach((item: any) => {
        const psi = item.player_skill_items;
        if (psi?.player_id !== playerId) return;
        const subName = psi?.skill_items?.skill_subcategories?.name;
        if (subName) {
          counts[subName] = (counts[subName] || 0) + 1;
        }
      });

      const sorted = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setData(sorted);
      setLoading(false);
    };
    fetch();
  }, [playerId]);

  const maxCount = data.length > 0 ? data[0].count : 1;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Skill Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Skill Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Skill Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="text-xs font-medium w-28 shrink-0 truncate">{item.name}</span>
              <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-info/60 transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-6 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
