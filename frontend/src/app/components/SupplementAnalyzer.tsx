import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  FileCheck, 
  Lightbulb, 
  PlusCircle,
  FlaskConical,
  X
} from "lucide-react";

export interface Interaction {
  supplements: string[];
  type: 'positive' | 'negative';
  description: string;
}

export interface Redundancy {
  supplements: string[];
  reason: string;
}

export interface EvidenceQuality {
  supplement: string;
  rating: 'Strong' | 'Moderate' | 'Weak' | 'Anecdotal';
  reason: string;
}

export interface AnalysisReport {
  interactions: Interaction[];
  redundancies: Redundancy[];
  evidenceQuality: EvidenceQuality[];
  recommendations: string[];
}

export function SupplementAnalyzer() {
  const [inputText, setInputText] = useState("");
  const [supplements, setSupplements] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSupplement = () => {
    const trimmed = inputText.trim();
    if (trimmed && !supplements.includes(trimmed.toLowerCase())) {
      setSupplements([...supplements, trimmed]);
      setInputText("");
    }
  };

  const handleRemoveSupplement = (index: number) => {
    setSupplements(supplements.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (supplements.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Call your backend API endpoint here
      const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : 'https://supplement-analyzer-vows.onrender.com';

      const response = await fetch(`${API_URL}/analyze`, {

      //const response = await fetch('https://supplement-analyzer-vows.onrender.com/analyze', {
      //const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         body: JSON.stringify({ supplements: supplements.join(', ') }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze supplements');
      }

      const data = await response.json();
      console.log('RAW RESPONSE:', JSON.stringify(data)); // 👈 add this line

      // Clean any accidental markdown wrapping
      let cleanResult = data.result
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

      // Extract JSON object even if there's stray text around it
      const jsonMatch = cleanResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
      throw new Error('Could not parse analysis response');
  }

  const report: AnalysisReport = JSON.parse(jsonMatch[0]);
  setAnalysis(report);

      } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Analysis error:', err);
      } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSupplements([]);
    setAnalysis(null);
    setInputText("");
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddSupplement();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <FlaskConical className="w-8 h-8 text-indigo-600" />
          <h1 className="text-4xl text-gray-900">Supplement Stack Analyzer</h1>
        </div>
        <p className="text-gray-600">
          Analyze your supplements for interactions, redundancies, and evidence quality
        </p>
      </div>

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle>Enter Your Supplements</CardTitle>
          <CardDescription>
            Add each supplement you're currently taking, one at a time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Textarea
              placeholder="e.g., Vitamin D, Omega-3 Fish Oil, Magnesium..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={handleAddSupplement} 
              disabled={!inputText.trim()}
              className="self-end"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {supplements.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {supplements.map((supplement, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="px-3 py-1.5 text-sm flex items-center gap-2"
                  >
                    {supplement}
                    <button
                      onClick={() => handleRemoveSupplement(index)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Stack"}
                </Button>
                <Button 
                  onClick={handleClear} 
                  variant="outline"
                  disabled={isAnalyzing}
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Interactions */}
          <Card className="shadow-lg border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5" />
                Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.interactions.length === 0 ? (
                <p className="text-gray-600">No significant interactions detected.</p>
              ) : (
                <ul className="space-y-3">
                  {analysis.interactions.map((interaction, index) => (
                    <li key={index} className="flex gap-3">
                      <div className="mt-1">
                        {interaction.type === 'positive' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {interaction.supplements.join(' + ')}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {interaction.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Redundancies */}
          <Card className="shadow-lg border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Copy className="w-5 h-5" />
                Redundancies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.redundancies.length === 0 ? (
                <p className="text-gray-600">No redundancies detected.</p>
              ) : (
                <ul className="space-y-3">
                  {analysis.redundancies.map((redundancy, index) => (
                    <li key={index} className="border-l-2 border-yellow-300 pl-4 py-2">
                      <p className="font-medium text-gray-900">
                        {redundancy.supplements.join(', ')}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {redundancy.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Evidence Quality */}
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <FileCheck className="w-5 h-5" />
                Evidence Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.evidenceQuality.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-start justify-between gap-4 pb-3 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.supplement}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                    </div>
                    <Badge 
                      variant={
                        item.rating === 'Strong' ? 'default' :
                        item.rating === 'Moderate' ? 'secondary' :
                        'outline'
                      }
                      className={
                        item.rating === 'Strong' ? 'bg-green-600' :
                        item.rating === 'Moderate' ? 'bg-blue-500' :
                        item.rating === 'Weak' ? 'bg-orange-500 text-white' :
                        'bg-gray-400 text-white'
                      }
                    >
                      {item.rating}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Lightbulb className="w-5 h-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 pt-0.5">{recommendation}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Important:</strong> This analysis is for informational purposes only. 
              Always consult a healthcare professional before making changes to your supplement regimen.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}