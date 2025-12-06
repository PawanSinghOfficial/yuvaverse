import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import UserAvatar, { AvatarConfig } from "@/components/UserAvatar";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, Shuffle } from "lucide-react";

const DEFAULT_CONFIG: AvatarConfig = {
  skinTone: "#E0AC69",
  hairStyle: "short",
  hairColor: "#2C2C2C",
  topStyle: "tshirt",
  topColor: "#3B82F6",
  bottomStyle: "jeans",
  bottomColor: "#1F2937",
  accessories: "none",
  accessoryColor: "#F59E0B",
  facialHair: "none",
  eyes: "normal",
  mouth: "smile",
  backgroundColor: "#F3F4F6",
};

export default function AvatarEditor() {
  const navigate = useNavigate();
  const user = useQuery(api.users.currentUser);
  const updateAvatarConfig = useMutation(api.users.updateAvatarConfig);
  
  const [config, setConfig] = useState<AvatarConfig>(user?.avatarConfig || DEFAULT_CONFIG);
  const [activePose, setActivePose] = useState<"portrait" | "standing" | "cheering" | "thinking" | "typing" | "gaming" | "laptop" | "reading" | "waving" | "thumbs_up" | "holding_phone" | "crossed_arms" | "sleeping" | "confused" | "winning" | "listening">("portrait");

  const handleSave = async () => {
    try {
      await updateAvatarConfig({ config });
      toast.success("Avatar updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to save avatar");
    }
  };

  const randomize = () => {
    const randomColor = () => `#${Math.floor(Math.random()*16777215).toString(16)}`;
    setConfig({
      ...config,
      skinTone: ["#FFDFC4", "#E0AC69", "#8D5524"][Math.floor(Math.random() * 3)],
      hairStyle: ["short", "long", "messy", "bald"][Math.floor(Math.random() * 4)],
      hairColor: ["#2C2C2C", "#6A4E23", "#E6CEA8", "#A52A2A"][Math.floor(Math.random() * 4)],
      topColor: ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"][Math.floor(Math.random() * 4)],
      eyes: ["normal", "happy", "glasses", "wink"][Math.floor(Math.random() * 4)],
      mouth: ["smile", "laugh", "neutral", "surprised"][Math.floor(Math.random() * 4)],
      accessoryColor: ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"][Math.floor(Math.random() * 4)],
    });
  };

  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Avatar Studio</h1>
          </div>

          <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black min-h-[400px]">
              <UserAvatar config={config} size="2xl" pose={activePose} className="shadow-2xl" />
              
              <div className="flex gap-2 mt-8 flex-wrap justify-center">
                {(["portrait", "standing", "cheering", "thinking", "gaming", "laptop", "reading", "waving", "thumbs_up", "sleeping", "confused", "winning"] as const).map((pose) => (
                  <Button
                    key={pose}
                    variant={activePose === pose ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActivePose(pose)}
                    className="capitalize"
                  >
                    {pose}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button className="flex-1" variant="outline" onClick={randomize}>
              <Shuffle className="mr-2 h-4 w-4" /> Randomize
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save Avatar
            </Button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-none bg-transparent">
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="w-full justify-start mb-6 bg-transparent border-b rounded-none h-auto p-0 gap-6">
                <TabsTrigger value="appearance" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-lg">Appearance</TabsTrigger>
                <TabsTrigger value="style" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-lg">Style</TabsTrigger>
                <TabsTrigger value="face" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-lg">Face</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-base">Skin Tone</Label>
                  <div className="flex gap-3">
                    {["#FFDFC4", "#E0AC69", "#8D5524"].map((color) => (
                      <button
                        key={color}
                        className={`w-12 h-12 rounded-full border-2 ${config.skinTone === color ? 'border-primary scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateConfig("skinTone", color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Hair Style</Label>
                  <div className="grid grid-cols-4 gap-4">
                    {["short", "long", "messy", "bald"].map((style) => (
                      <div 
                        key={style}
                        className={`cursor-pointer border-2 rounded-lg p-2 text-center capitalize ${config.hairStyle === style ? 'border-primary bg-primary/5' : 'border-border'}`}
                        onClick={() => updateConfig("hairStyle", style)}
                      >
                        {style}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Hair Color</Label>
                  <div className="flex gap-3">
                    {["#2C2C2C", "#6A4E23", "#E6CEA8", "#A52A2A"].map((color) => (
                      <button
                        key={color}
                        className={`w-12 h-12 rounded-full border-2 ${config.hairColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateConfig("hairColor", color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Background Color</Label>
                  <div className="flex gap-3 flex-wrap">
                    {["#F3F4F6", "#E5E7EB", "#D1D5DB", "#FECACA", "#BFDBFE", "#BBF7D0", "#FDE68A", "#E9D5FF"].map((color) => (
                      <button
                        key={color}
                        className={`w-12 h-12 rounded-full border-2 ${config.backgroundColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateConfig("backgroundColor", color)}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-base">Top Style</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {["tshirt", "hoodie", "formal", "blazer", "sweater"].map((style) => (
                      <div 
                        key={style}
                        className={`cursor-pointer border-2 rounded-lg p-2 text-center capitalize ${config.topStyle === style ? 'border-primary bg-primary/5' : 'border-border'}`}
                        onClick={() => updateConfig("topStyle", style)}
                      >
                        {style}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Top Color</Label>
                  <div className="flex gap-3 flex-wrap">
                    {["#EF4444", "#3B82F6", "#10B981", "#1F2937", "#F3F4F6", "#F59E0B", "#8B5CF6", "#EC4899"].map((color) => (
                      <button
                        key={color}
                        className={`w-12 h-12 rounded-full border-2 ${config.topColor === color ? 'border-primary scale-110' : 'border-gray-200'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateConfig("topColor", color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Bottom Style</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {["jeans", "shorts", "skirt", "sweatpants"].map((style) => (
                      <div 
                        key={style}
                        className={`cursor-pointer border-2 rounded-lg p-2 text-center capitalize ${config.bottomStyle === style ? 'border-primary bg-primary/5' : 'border-border'}`}
                        onClick={() => updateConfig("bottomStyle", style)}
                      >
                        {style}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Bottom Color</Label>
                  <div className="flex gap-3 flex-wrap">
                    {["#1F2937", "#374151", "#4B5563", "#6B7280", "#2563EB", "#7C3AED"].map((color) => (
                      <button
                        key={color}
                        className={`w-12 h-12 rounded-full border-2 ${config.bottomColor === color ? 'border-primary scale-110' : 'border-gray-200'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateConfig("bottomColor", color)}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="face" className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-base">Eyes</Label>
                  <div className="grid grid-cols-4 gap-4">
                    {["normal", "happy", "glasses", "wink"].map((style) => (
                      <div 
                        key={style}
                        className={`cursor-pointer border-2 rounded-lg p-2 text-center capitalize ${config.eyes === style ? 'border-primary bg-primary/5' : 'border-border'}`}
                        onClick={() => updateConfig("eyes", style)}
                      >
                        {style}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Mouth</Label>
                  <div className="grid grid-cols-4 gap-4">
                    {["smile", "laugh", "neutral", "surprised"].map((style) => (
                      <div 
                        key={style}
                        className={`cursor-pointer border-2 rounded-lg p-2 text-center capitalize ${config.mouth === style ? 'border-primary bg-primary/5' : 'border-border'}`}
                        onClick={() => updateConfig("mouth", style)}
                      >
                        {style}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Accessories</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {["none", "cap", "beanie", "sunglasses", "headphones", "bandana", "scarf", "necklace", "earrings", "mask"].map((style) => (
                      <div 
                        key={style}
                        className={`cursor-pointer border-2 rounded-lg p-2 text-center capitalize ${config.accessories === style ? 'border-primary bg-primary/5' : 'border-border'}`}
                        onClick={() => updateConfig("accessories", style)}
                      >
                        {style}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Accessory Color</Label>
                  <div className="flex gap-3 flex-wrap">
                    {["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#1F2937", "#F3F4F6", "#8B5CF6", "#EC4899"].map((color) => (
                      <button
                        key={color}
                        className={`w-12 h-12 rounded-full border-2 ${config.accessoryColor === color ? 'border-primary scale-110' : 'border-gray-200'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateConfig("accessoryColor", color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Facial Hair</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {["none", "beard", "mustache", "goatee"].map((style) => (
                      <div 
                        key={style}
                        className={`cursor-pointer border-2 rounded-lg p-2 text-center capitalize ${config.facialHair === style ? 'border-primary bg-primary/5' : 'border-border'}`}
                        onClick={() => updateConfig("facialHair", style)}
                      >
                        {style}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}