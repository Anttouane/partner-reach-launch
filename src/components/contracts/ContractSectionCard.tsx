import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MessageSquare, ChevronDown, ChevronUp, Check, Send, History } from 'lucide-react';
import { ContractComment, ContractChange, SECTION_LABELS, ContractSection } from '@/types/contract';
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
    // Map field names to sections
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

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{SECTION_LABELS[section]}</CardTitle>
          <div className="flex items-center gap-2">
            {sectionChanges.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-1"
              >
                <History className="h-4 w-4" />
                <span className="text-xs">{sectionChanges.length}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className={cn('gap-1', unresolvedCount > 0 && 'text-orange-500')}
            >
              <MessageSquare className="h-4 w-4" />
              {unresolvedCount > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 justify-center text-xs">
                  {unresolvedCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}

        {/* Change History */}
        <Collapsible open={showHistory} onOpenChange={setShowHistory}>
          <CollapsibleContent className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique des modifications
            </h4>
            {sectionChanges.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune modification</p>
            ) : (
              <div className="space-y-2">
                {sectionChanges.map(change => (
                  <div key={change.id} className="text-sm bg-muted/50 rounded p-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>v{change.version}</span>
                      <span>{format(new Date(change.created_at), 'dd MMM HH:mm', { locale: fr })}</span>
                    </div>
                    <p className="text-xs">
                      <span className="font-medium">{change.field_name}</span>:{' '}
                      <span className="line-through text-red-500">{change.old_value || '(vide)'}</span>{' '}
                      → <span className="text-green-600">{change.new_value || '(vide)'}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Comments */}
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleContent className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Commentaires
            </h4>
            
            <div className="space-y-2 mb-3">
              {sectionComments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun commentaire</p>
              ) : (
                sectionComments.map(comment => (
                  <div
                    key={comment.id}
                    className={cn(
                      'text-sm rounded p-2',
                      comment.resolved ? 'bg-green-50 dark:bg-green-950' : 'bg-muted/50'
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <p className={cn(comment.resolved && 'line-through text-muted-foreground')}>
                        {comment.content}
                      </p>
                      {!comment.resolved && !isLocked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => onResolveComment(comment.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(comment.created_at), 'dd MMM HH:mm', { locale: fr })}
                      {comment.resolved && ' · Résolu'}
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
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendComment} disabled={sending || !newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
