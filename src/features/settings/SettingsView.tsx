import React, { useEffect } from "react";
import { Switch } from "../../components/ui/Switch";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Separator } from "../../components/ui/Separator";
import { useSettingsStore } from "../../stores/settings.store";
import { keyboardShortcut } from "../../utils";
import { Shield, Sparkles, Sliders, RotateCcw } from "lucide-react";

export const SettingsView: React.FC = () => {
  const { settings, loadSettings, updateSettings, resetSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="space-y-4 select-none">
      {/* Real-time Verification Control */}
      <Card variant="glass" className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h4 className="text-xs font-semibold text-primary">Live Real-time Verification</h4>
          </div>
          <Switch
            checked={settings.liveVerificationEnabled}
            onCheckedChange={(val) => updateSettings({ liveVerificationEnabled: val })}
          />
        </div>
        <p className="text-xs text-primary-muted leading-relaxed">
          Automatically intercept streaming AI responses across ChatGPT, Gemini, Claude, and Copilot.
        </p>
      </Card>

      {/* Keyboard Shortcut Setting */}
      <Card variant="glass" className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary-muted" />
            <h4 className="text-xs font-semibold text-primary">Toggle Sidebar Shortcut</h4>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-surface-elevated border border-border text-accent">
            {keyboardShortcut(settings.keyboardShortcut)}
          </span>
        </div>
        <p className="text-xs text-primary-muted">
          Use key combination to toggle floating PRAMAAN sidebar anywhere.
        </p>
      </Card>

      {/* Filter & Privacy Preferences */}
      <Card variant="glass" className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-primary">Trusted Sources Only</h4>
            <p className="text-[11px] text-primary-muted mt-0.5">
              Limit evidence lookup to verified academic journals and tier-1 domains.
            </p>
          </div>
          <Switch
            checked={settings.trustedSourcesOnly}
            onCheckedChange={(val) => updateSettings({ trustedSourcesOnly: val })}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-primary">Auto Highlight Claims</h4>
            <p className="text-[11px] text-primary-muted mt-0.5">
              Inject interactive status underlines directly into assistant response paragraphs.
            </p>
          </div>
          <Switch
            checked={settings.autoHighlightSentences}
            onCheckedChange={(val) => updateSettings({ autoHighlightSentences: val })}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-primary">Privacy Analytics</h4>
            <p className="text-[11px] text-primary-muted mt-0.5">
              Help improve verification models by sharing anonymous performance diagnostics.
            </p>
          </div>
          <Switch
            checked={settings.privacyAnalytics}
            onCheckedChange={(val) => updateSettings({ privacyAnalytics: val })}
          />
        </div>
      </Card>

      {/* About & Reset Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 text-xs text-primary-muted">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>PRAMAAN Engine v1.0.0</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={() => resetSettings()}
        >
          Reset Defaults
        </Button>
      </div>
    </div>
  );
};
