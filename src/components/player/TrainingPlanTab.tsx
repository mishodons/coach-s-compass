import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatusBadge } from '@/components/StatusBadge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TrainingPlanTabProps {
  playerId: string;
}

interface SkillItemWithDetails {
  id: string;
  status: number;
  skill_item_id: string;
  skill_name: string;
  subcategory_name: string;
  category_name: string;
  category_id: string;
  subcategory_id: string;
}

export function TrainingPlanTab({ playerId }: TrainingPlanTabProps) {
  const [items, setItems] = useState<SkillItemWithDetails[]>([]);
  const [view, setView] = useState<'accordion' | 'kanban'>('accordion');

  const fetchItems = async () => {
    const { data } = await supabase
      .from('player_skill_items')
      .select(`
        id, status, skill_item_id, is_active,
        skill_items:skill_item_id(
          name,
          skill_subcategories:subcategory_id(
            id, name,
            skill_categories:category_id(id, name)
          )
        )
      `)
      .eq('player_id', playerId)
      .eq('is_active', true);

    const mapped = (data || []).map((d: any) => ({
      id: d.id,
      status: d.status,
      skill_item_id: d.skill_item_id,
      skill_name: d.skill_items?.name || '',
      subcategory_name: d.skill_items?.skill_subcategories?.name || '',
      subcategory_id: d.skill_items?.skill_subcategories?.id || '',
      category_name: d.skill_items?.skill_subcategories?.skill_categories?.name || '',
      category_id: d.skill_items?.skill_subcategories?.skill_categories?.id || '',
    }));
    setItems(mapped);
  };

  useEffect(() => {
    fetchItems();
  }, [playerId]);

  const cycleStatus = async (itemId: string, current: number) => {
    const next = current >= 3 ? 1 : current + 1;
    await supabase.from('player_skill_items').update({ status: next }).eq('id', itemId);
    setItems(items.map((i) => i.id === itemId ? { ...i, status: next } : i));
  };

  const updateStatus = async (itemId: string, newStatus: number) => {
    await supabase.from('player_skill_items').update({ status: newStatus }).eq('id', itemId);
    setItems(items.map((i) => i.id === itemId ? { ...i, status: newStatus } : i));
  };

  // Group by category then subcategory
  const categories = Array.from(new Set(items.map((i) => i.category_id)));
  const grouped = categories.map((catId) => {
    const catItems = items.filter((i) => i.category_id === catId);
    const catName = catItems[0]?.category_name || '';
    const subcats = Array.from(new Set(catItems.map((i) => i.subcategory_id)));
    return {
      id: catId,
      name: catName,
      subcategories: subcats.map((subId) => {
        const subItems = catItems.filter((i) => i.subcategory_id === subId);
        return {
          id: subId,
          name: subItems[0]?.subcategory_name || '',
          items: subItems,
        };
      }),
      counts: {
        incomplete: catItems.filter((i) => i.status === 1).length,
        inProgress: catItems.filter((i) => i.status === 2).length,
        complete: catItems.filter((i) => i.status === 3).length,
      },
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{items.filter((i) => i.status === 3).length}/{items.length} complete</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'accordion' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('accordion')}
          >
            List
          </Button>
          <Button
            variant={view === 'kanban' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('kanban')}
          >
            Board
          </Button>
        </div>
      </div>

      {view === 'accordion' ? (
        <Accordion type="multiple" className="space-y-2">
          {grouped.map((cat) => (
            <AccordionItem key={cat.id} value={cat.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{cat.name}</span>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs bg-muted">{cat.counts.incomplete}</Badge>
                    <Badge variant="outline" className="text-xs bg-warning/15 text-warning border-warning/30">{cat.counts.inProgress}</Badge>
                    <Badge variant="outline" className="text-xs bg-success/15 text-success border-success/30">{cat.counts.complete}</Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="multiple" className="pl-4 space-y-1">
                  {cat.subcategories.map((sub) => (
                    <AccordionItem key={sub.id} value={sub.id} className="border-none">
                      <AccordionTrigger className="hover:no-underline py-2 text-sm">
                        {sub.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pl-2">
                          {sub.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-1.5">
                              <span className="text-sm">{item.skill_name}</span>
                              <StatusBadge
                                status={item.status}
                                onClick={() => cycleStatus(item.id, item.status)}
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        /* Kanban view */
        <div className="grid grid-cols-3 gap-4">
          {[
            { status: 1, label: 'Incomplete', className: 'bg-muted/50' },
            { status: 2, label: 'In Progress', className: 'bg-warning/5' },
            { status: 3, label: 'Complete', className: 'bg-success/5' },
          ].map((col) => (
            <div key={col.status} className={`rounded-lg p-3 ${col.className} min-h-[300px]`}>
              <h3 className="text-sm font-medium mb-3">{col.label} ({items.filter((i) => i.status === col.status).length})</h3>
              <div
                className="space-y-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const itemId = e.dataTransfer.getData('text/plain');
                  updateStatus(itemId, col.status);
                }}
              >
                {items.filter((i) => i.status === col.status).map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
                    className="bg-card border rounded-md p-2.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-medium">{item.skill_name}</p>
                    <p className="text-xs text-muted-foreground">{item.category_name} › {item.subcategory_name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
