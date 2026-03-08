import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { MessageSquare, Check, Send, History } from 'lucide-react';
import { ContractComment, ContractChange, SECTION_LABELS, ContractSection, SECTION_ICONS } from '@/types/contract';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ContractSectionCardProps {
  section: ContractSection;
  children: React.ReactNode;
  comments: ContractComment[];
  changes: ContractChange[];
  isLocked: boolean;
  onAddComment: (content: string) => Promise<void>;
  onResolveComment: (commentId: string) => Promise<void>;
  currentUserId: string;
}

export function ContractSectionCard({
  section,
  children,
  comments,
  changes,
  isLocked,
  onAddComment,
  onResolveComment,
  currentUserId,
}: ContractSectionCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  const sectionComments = comments.filter(c => c.section === section);
  const unresolvedCount = sectionComments.filter(c => !c.resolved).length;
  const sectionChanges = changes.filter(c => {
    const fieldToSection: Record<string, ContractSection> = {
      brand_name: 'parties',
      brand_company: 'parties',
      brand_address: 'parties',
      creator_name: 'parties',
      creator_address: 'parties',
      campaign_title: 'campaign',
      campaign_description: 'campaign',
      deliverables: 'campaign',
      content_types: 'campaign',
      platforms: 'campaign',
      deadline: 'campaign',
      usage_rights: 'campaign',
      exclusivity_period: 'campaign',
      total_amount: 'financial',
      platform_commission_rate: 'financial',
      payment_terms: 'financial',
      brand_obligations: 'obligations',
      creator_obligations: 'obligations',
      validation_deadline_days: 'validation',
      dispute_resolution: 'validation',
    };
    return fieldToSection[c.field_name] === section;
  });

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    await onAddComment(newComment.trim());
    setNewComment('');
    setSending(false);
  };

  const Icon = SECTION_ICONS[section];

  return (
    <Card className="mb-4 overflow-hidden border-border/60 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-shadow duration-300">
      <CardHeader className="pb-3 bg-gradient-to-r from-muted/30 to-transparent border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            {SECTION_LABELS[section]}
          </CardTitle>
          <div className="flex items-center gap-1">
            {sectionChanges.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-1 h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <History className="h-3.5 w-3.5" />
                <span className="text-xs">{sectionChanges.length}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className={cn('gap-1 h-8 px-2', unresolvedCount > 0 ? 'text-secondary' : 'text-muted-foreground hover:text-foreground')}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {unresolvedCount > 0 && (
                <Badge className="h-5 min-w-[20px] p-0 justify-center text-[10px] bg-secondary text-secondary-foreground">
                  {unresolvedCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {children}

        {/* Change History */}
        <Collapsible open={showHistory} onOpenChange={setShowHistory}>
          <CollapsibleContent className="mt-5 border-t border-border/40 pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
              <History className="h-4 w-4" />
              Historique des modifications
            </h4>
            {sectionChanges.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune modification</p>
            ) : (
              <div className="space-y-2">
                {sectionChanges.map(change => (
                  <div key={change.id} className="text-sm bg-muted/40 rounded-lg p-3 border border-border/30">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <Badge variant="outline" className="text-[10px] h-5">v{change.version}</Badge>
                      <span>{format(new Date(change.created_at), 'dd MMM HH:mm', { locale: fr })}</span>
                    </div>
                    <p className="text-xs">
                      <span className="font-medium">{change.field_name}</span>:{' '}
                      <span className="line-through text-destructive/70">{change.old_value || '(vide)'}</span>{' '}
                      → <span className="text-green-600 font-medium">{change.new_value || '(vide)'}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Comments */}
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleContent className="mt-5 border-t border-border/40 pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              Commentaires
            </h4>
            
            <div className="space-y-2 mb-3">
              {sectionComments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucun commentaire pour cette section</p>
              ) : (
                sectionComments.map(comment => (
                  <div
                    key={comment.id}
                    className={cn(
                      'text-sm rounded-lg p-3 border',
                      comment.resolved 
                        ? 'bg-green-50/50 dark:bg-green-950/30 border-green-200/50 dark:border-green-800/30' 
                        : 'bg-muted/30 border-border/30'
                    )}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className={cn('flex-1', comment.resolved && 'line-through text-muted-foreground')}>
                        {comment.content}
                      </p>
                      {!comment.resolved && !isLocked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => onResolveComment(comment.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {format(new Date(comment.created_at), 'dd MMM HH:mm', { locale: fr })}
                      {comment.resolved && ' · ✓ Résolu'}
                    </p>
                  </div>
                ))
              )}
            </div>

            {!isLocked && (
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                  disabled={sending}
                  className="flex-1 h-9 text-sm"
                />
                <Button size="sm" onClick={handleSendComment} disabled={sending || !newComment.trim()} className="h-9 px-3">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
