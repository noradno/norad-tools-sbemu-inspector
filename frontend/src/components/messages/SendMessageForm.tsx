import { useState } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, X, Plus, Minus, Loader2 } from 'lucide-react';

export function SendMessageForm() {
  const [body, setBody] = useState('');
  const [contentType, setContentType] = useState('application/json');
  const [properties, setProperties] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sendMessage } = useMessageStore();
  const { toggleSendForm } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const applicationProperties: Record<string, unknown> = {};
      properties.forEach(prop => {
        if (prop.key.trim() && prop.value.trim()) {
          applicationProperties[prop.key.trim()] = prop.value.trim();
        }
      });

      await sendMessage({
        body,
        contentType: contentType || undefined,
        applicationProperties: Object.keys(applicationProperties).length > 0 ? applicationProperties : undefined,
      });

      // Reset form
      setBody('');
      setContentType('application/json');
      setProperties([{ key: '', value: '' }]);
      toggleSendForm();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProperty = () => {
    setProperties([...properties, { key: '', value: '' }]);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const updateProperty = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...properties];
    updated[index][field] = value;
    setProperties(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Message
            </CardTitle>
            <CardDescription>
              Send a new message to the connected queue or topic
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleSendForm}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="messageBody">Message Body</Label>
            <textarea
              id="messageBody"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"message": "Hello, World!"}'
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Input
              id="contentType"
              type="text"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              placeholder="application/json"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Application Properties</Label>
              <Button type="button" variant="outline" size="sm" onClick={addProperty}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {properties.map((property, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Property key"
                  value={property.key}
                  onChange={(e) => updateProperty(index, 'key', e.target.value)}
                />
                <Input
                  placeholder="Property value"
                  value={property.value}
                  onChange={(e) => updateProperty(index, 'value', e.target.value)}
                />
                {properties.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeProperty(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isSubmitting || !body.trim()} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}