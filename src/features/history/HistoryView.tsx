import React, { useEffect, useState } from "react";
import { Search, Download, Trash2, History as HistoryIcon, ShieldCheck } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useHistoryStore } from "../../stores/history.store";
import { formatDate } from "../../utils";

export const HistoryView: React.FC = () => {
  const { items, fetchHistory, clearAll, filter, setFilter } = useHistoryStore();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pramaan_verification_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4 select-none">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search verification history..."
            value={filter.query || ""}
            onChange={(e) => setFilter({ query: e.target.value })}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={handleExportJSON}
          title="Export History JSON"
        >
          Export
        </Button>
        <Button
          size="sm"
          variant="danger"
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          onClick={() => setIsClearModalOpen(true)}
          title="Clear History"
        >
          Clear
        </Button>
      </div>

      {/* History Items List */}
      {items.length === 0 ? (
        <div className="p-8 text-center glass-card rounded-32 border border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-primary-muted flex items-center justify-center mx-auto">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-primary">No History Records Found</h3>
          <p className="text-xs text-primary-muted max-w-xs mx-auto">
            Verified AI prompt responses will automatically save to your local history archive.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} variant="glass" className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="accent" size="sm">
                  {item.platform}
                </Badge>
                <span className="text-[10px] font-mono text-primary-muted">
                  {formatDate(item.timestamp)}
                </span>
              </div>
              <p className="text-xs font-medium text-primary line-clamp-2">{item.snippet}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-[11px] font-mono text-status-success font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {item.trustScore}% Trust Score
                </span>
                <span className="text-[10px] font-mono text-primary-muted">
                  {item.totalClaims} Claims ({item.verifiedClaims} Verified)
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear Verification History"
      >
        <div className="space-y-4">
          <p className="text-xs text-primary-muted leading-relaxed">
            Are you sure you want to delete all saved verification records? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="sm" variant="secondary" onClick={() => setIsClearModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={async () => {
                await clearAll();
                setIsClearModalOpen(false);
              }}
            >
              Clear All History
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
