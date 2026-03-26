import React, { useState, useRef } from 'react';
import { GameCard } from './GameCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Trash2, Upload, Download, FileText, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CardData {
  id: string;
  cardNumber: string;
  title: string;
  subtitle: string;
  mainQuestion: string;
  followUpQuestion: string;
  hashtags: string[];
  brandColors: {
    primary: string;
    secondary: string;
  };
}

export function CardGenerator() {
  const [cards, setCards] = useState<CardData[]>([
    {
      id: '1',
      cardNumber: 'Card 1',
      title: 'QCon',
      subtitle: 'QCONVERSATION STARTER',
      mainQuestion: "What's the most surprising insight you've heard at QCon so far?",
      followUpQuestion: "How might that insight affect the way you work next week?",
      hashtags: ['#AI', '#Leadership', '#TeamCulture', '#TechTrends'],
      brandColors: { primary: '#22c55e', secondary: '#3b82f6' }
    }
  ]);

  const [selectedCardId, setSelectedCardId] = useState<string>('1');
  const [hashtagInput, setHashtagInput] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCard = cards.find(card => card.id === selectedCardId);

  const addNewCard = () => {
    const newCard: CardData = {
      id: Date.now().toString(),
      cardNumber: `Card ${cards.length + 1}`,
      title: 'Your Brand',
      subtitle: 'CONVERSATION STARTER',
      mainQuestion: 'Enter your question here...',
      followUpQuestion: 'Add a follow-up question...',
      hashtags: ['#Topic1', '#Topic2'],
      brandColors: { primary: '#22c55e', secondary: '#3b82f6' }
    };
    setCards([...cards, newCard]);
    setSelectedCardId(newCard.id);
  };

  const deleteCard = (cardId: string) => {
    if (cards.length > 1) {
      const newCards = cards.filter(card => card.id !== cardId);
      setCards(newCards);
      if (selectedCardId === cardId) {
        setSelectedCardId(newCards[0].id);
      }
    }
  };

  const updateCard = (field: keyof CardData, value: any) => {
    setCards(cards.map(card => 
      card.id === selectedCardId 
        ? { ...card, [field]: value }
        : card
    ));
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && selectedCard) {
      const newHashtag = hashtagInput.startsWith('#') ? hashtagInput : `#${hashtagInput}`;
      updateCard('hashtags', [...selectedCard.hashtags, newHashtag]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (index: number) => {
    if (selectedCard) {
      updateCard('hashtags', selectedCard.hashtags.filter((_, i) => i !== index));
    }
  };

  const parseCSV = (csvText: string): CardData[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const parsedCards: CardData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < headers.length) {
        continue; // Skip incomplete rows
      }

      const cardData: any = {};
      headers.forEach((header, index) => {
        cardData[header] = values[index] || '';
      });

      // Parse hashtags (expect comma-separated in quotes or semicolon-separated)
      let hashtags: string[] = [];
      if (cardData.hashtags) {
        hashtags = cardData.hashtags
          .split(/[;|]/)
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag)
          .map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`);
      }

      const newCard: CardData = {
        id: Date.now().toString() + i,
        cardNumber: cardData.cardnumber || `Card ${i}`,
        title: cardData.title || 'Untitled',
        subtitle: cardData.subtitle || 'CONVERSATION STARTER',
        mainQuestion: cardData.mainquestion || 'Enter your question here...',
        followUpQuestion: cardData.followupquestion || '',
        hashtags: hashtags.length > 0 ? hashtags : ['#Topic1'],
        brandColors: {
          primary: cardData.primarycolor || '#22c55e',
          secondary: cardData.secondarycolor || '#3b82f6'
        }
      };

      parsedCards.push(newCard);
    }

    return parsedCards;
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      const text = await file.text();
      const importedCards = parseCSV(text);
      
      if (importedCards.length === 0) {
        toast.error('No valid card data found in CSV');
        return;
      }

      setCards([...cards, ...importedCards]);
      toast.success(`Successfully imported ${importedCards.length} cards`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('CSV parsing error:', error);
      toast.error('Error parsing CSV file. Please check the format.');
    }
  };

  const downloadCSVTemplate = () => {
    const template = [
      'CardNumber,Title,Subtitle,MainQuestion,FollowupQuestion,Hashtags,PrimaryColor,SecondaryColor',
      'Card 1,MyBrand,CONVERSATION STARTER,"What is your favorite feature?","How would you improve it?","#Feature;#Feedback;#Product",#22c55e,#3b82f6',
      'Card 2,MyBrand,CONVERSATION STARTER,"What challenges do you face daily?","Which tool helps you most?","#Challenges;#Tools;#Productivity",#22c55e,#3b82f6'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'card-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight - y; // Return total height used
  };

  const drawCardToCanvas = (card: CardData): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size with 50px bleed on all sides
    // Poker card size: 63mm × 88mm at ~1168 DPI
    const bleed = 50;
    canvas.width = 2997; // 2897 + 50 + 50 (63mm at 1168 DPI)
    canvas.height = 4148; // 4048 + 50 + 50 (88mm at 1168 DPI)
    
    // Calculate scale factor based on base dimensions
    const baseWidth = 362.125; // 2897 / 8
    const baseHeight = 506; // 4048 / 8
    const scaleX = 2897 / baseWidth; // Scale for the card content area
    const scaleY = 4048 / baseHeight;
    
    // Apply scale and translate to center the card content
    ctx.scale(scaleX, scaleY);
    ctx.translate(bleed / scaleX, bleed / scaleY); // Offset by bleed area
    
    // Fill the entire canvas with bleed color (extended background)
    ctx.save();
    ctx.resetTransform();
    const bleedGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bleedGradient.addColorStop(0, '#f1f5f9');
    bleedGradient.addColorStop(1, '#dbeafe');
    ctx.fillStyle = bleedGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Create gradient background for the card area
    const gradient = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
    gradient.addColorStop(0, '#f1f5f9');
    gradient.addColorStop(1, '#dbeafe');
    
    // Draw background with rounded corners
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, baseWidth, baseHeight, 24);
    ctx.fill();
    
    // Draw hexagon patterns
    drawHexagon(ctx, 28, 28, 12, 0.2);
    drawHexagon(ctx, 56, 40, 8, 0.15);
    drawHexagon(ctx, baseWidth - 20, 468, 10, 0.2);
    drawHexagon(ctx, baseWidth - 48, 456, 8, 0.15);
    
    // Draw title
    ctx.textAlign = 'left';
    ctx.font = 'bold 36px system-ui, sans-serif';
    
    // First letter
    ctx.fillStyle = card.brandColors.primary;
    ctx.fillText(card.title.charAt(0), 24, 90);
    
    // Rest of title
    const firstLetterWidth = ctx.measureText(card.title.charAt(0)).width;
    ctx.fillStyle = card.brandColors.secondary;
    ctx.fillText(card.title.slice(1), 24 + firstLetterWidth, 90);
    
    // Draw subtitle
    ctx.fillStyle = '#475569';
    ctx.font = '500 14px system-ui, sans-serif';
    ctx.letterSpacing = '0.1em';
    ctx.fillText(card.subtitle, 24, 110);
    ctx.letterSpacing = '0';
    
    // Draw Q icon (moved up by 15px from 170 to 155)
    ctx.fillStyle = card.brandColors.secondary;
    ctx.beginPath();
    ctx.roundRect(24, 155, 48, 48, 12);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Q', 48, 185);
    
    // Draw main question (moved up by 15px from 195 to 180)
    ctx.fillStyle = '#1e293b';
    ctx.font = '20px system-ui, sans-serif';
    ctx.textAlign = 'left';
    const questionHeight = wrapText(ctx, card.mainQuestion, 84, 180, 212, 30);
    
    let currentY = 155 + questionHeight + 40;
    
    // Draw separator and follow-up question if exists (moved up accordingly)
    if (card.followUpQuestion) {
      // Draw line
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, currentY);
      ctx.lineTo(baseWidth - 24, currentY);
      ctx.stroke();
      
      currentY += 24;
      
      // Draw follow-up question
      ctx.fillStyle = '#475569';
      ctx.font = '18px system-ui, sans-serif';
      const followUpHeight = wrapText(ctx, card.followUpQuestion, 24, currentY, baseWidth - 48, 28);
      currentY += followUpHeight + 20;
    }
    
    // Draw hashtags (moved up by 20px from 450 to 430)
    ctx.fillStyle = '#2563eb';
    ctx.font = '500 14px system-ui, sans-serif';
    
    let tagX = 24;
    let tagY = 430; // Moved up by 20px for better spacing
    
    card.hashtags.forEach((tag, index) => {
      const tagWidth = ctx.measureText(tag).width;
      
      // Check if tag fits on current line
      if (tagX + tagWidth > baseWidth - 24 && tagX > 24) {
        tagX = 24;
        tagY += 24;
      }
      
      ctx.fillText(tag, tagX, tagY);
      tagX += tagWidth + 16; // Add spacing between tags
    });
    
    return canvas;
  };

  const exportAllCardsAsPNG = async () => {
    if (cards.length === 0) {
      toast.error('No cards to export');
      return;
    }

    setIsExporting(true);
    
    try {
      for (const card of cards) {
        const canvas = drawCardToCanvas(card);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `${card.cardNumber.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success(`Successfully exported ${cards.length} cards as PNG files`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting cards. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Card Game Generator</h1>
          <div className="flex gap-4">
            <Button onClick={downloadCSVTemplate} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button 
              onClick={exportAllCardsAsPNG} 
              disabled={isExporting || cards.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export All as PNG'}
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="hidden"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Print Size Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Print Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Card Size:</strong> 63×88mm (poker card size)</p>
                  <p><strong>Export Resolution:</strong> 2997×4148 pixels with 50px bleed</p>
                  <p><strong>Card Content Area:</strong> 2897×4048 pixels (centered)</p>
                  <p><strong>Print DPI:</strong> ~1168 DPI for professional quality</p>
                  <p className="text-green-600 font-medium">✓ Ready for professional printing with bleed area</p>
                </div>
              </CardContent>
            </Card>

            {/* Import Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>CSV Import Format</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Your CSV should have these columns: <strong>CardNumber, Title, Subtitle, MainQuestion, FollowupQuestion, Hashtags, PrimaryColor, SecondaryColor</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Separate hashtags with semicolons (;). Colors should be in hex format (#22c55e).
                </p>
              </CardContent>
            </Card>

            {/* Card Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Card Selection ({cards.length} cards)
                  <Button onClick={addNewCard} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {cards.map((card) => (
                    <div key={card.id} className="flex items-center gap-2">
                      <Button
                        variant={selectedCardId === card.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCardId(card.id)}
                      >
                        {card.cardNumber}
                      </Button>
                      {cards.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCard(card.id)}
                          className="w-6 h-6 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedCard && (
              <>
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={selectedCard.cardNumber}
                        onChange={(e) => updateCard('cardNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Brand/Title</Label>
                      <Input
                        id="title"
                        value={selectedCard.title}
                        onChange={(e) => updateCard('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={selectedCard.subtitle}
                        onChange={(e) => updateCard('subtitle', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Questions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="mainQuestion">Main Question</Label>
                      <Textarea
                        id="mainQuestion"
                        value={selectedCard.mainQuestion}
                        onChange={(e) => updateCard('mainQuestion', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="followUpQuestion">Follow-up Question</Label>
                      <Textarea
                        id="followUpQuestion"
                        value={selectedCard.followUpQuestion}
                        onChange={(e) => updateCard('followUpQuestion', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Brand Colors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color (First Letter)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={selectedCard.brandColors.primary}
                          onChange={(e) => updateCard('brandColors', {
                            ...selectedCard.brandColors,
                            primary: e.target.value
                          })}
                          className="w-12 h-10"
                        />
                        <Input
                          value={selectedCard.brandColors.primary}
                          onChange={(e) => updateCard('brandColors', {
                            ...selectedCard.brandColors,
                            primary: e.target.value
                          })}
                          placeholder="#22c55e"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color (Rest of Title & Q Icon)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={selectedCard.brandColors.secondary}
                          onChange={(e) => updateCard('brandColors', {
                            ...selectedCard.brandColors,
                            secondary: e.target.value
                          })}
                          className="w-12 h-10"
                        />
                        <Input
                          value={selectedCard.brandColors.secondary}
                          onChange={(e) => updateCard('brandColors', {
                            ...selectedCard.brandColors,
                            secondary: e.target.value
                          })}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hashtags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hashtags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add hashtag..."
                        value={hashtagInput}
                        onChange={(e) => setHashtagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                      />
                      <Button onClick={addHashtag}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCard.hashtags.map((tag, index) => (
                        <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          <span>{tag}</span>
                          <button
                            onClick={() => removeHashtag(index)}
                            className="text-blue-600 hover:text-blue-800 ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            {selectedCard && (
              <GameCard
                cardNumber={selectedCard.cardNumber}
                title={selectedCard.title}
                subtitle={selectedCard.subtitle}
                mainQuestion={selectedCard.mainQuestion}
                followUpQuestion={selectedCard.followUpQuestion}
                hashtags={selectedCard.hashtags}
                brandColors={selectedCard.brandColors}
              />
            )}
          </div>
        </div>

        {/* All Cards Display */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">All Your Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {cards.map((card) => (
              <GameCard
                key={card.id}
                cardNumber={card.cardNumber}
                title={card.title}
                subtitle={card.subtitle}
                mainQuestion={card.mainQuestion}
                followUpQuestion={card.followUpQuestion}
                hashtags={card.hashtags}
                brandColors={card.brandColors}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}