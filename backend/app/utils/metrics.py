"""Metrics collection and monitoring for PRAMAAN AI."""

import time
from typing import Dict, Optional
from collections import defaultdict, deque
from datetime import datetime, timedelta
from app.utils.logger import get_logger


class MetricsCollector:
    """Collects and tracks application metrics."""
    
    def __init__(self, max_history_size: int = 1000):
        """Initialize metrics collector.
        
        Args:
            max_history_size: Maximum number of data points to keep per metric
        """
        self.metrics: Dict[str, deque] = defaultdict(lambda: deque(maxlen=max_history_size))
        self.counters: Dict[str, int] = defaultdict(int)
        self.gauges: Dict[str, float] = defaultdict(float)
        self.logger = get_logger(__name__)
        self.start_time = datetime.utcnow()
    
    def increment(self, metric_name: str, value: int = 1):
        """Increment a counter metric.
        
        Args:
            metric_name: Name of the metric
            value: Value to increment by
        """
        self.counters[metric_name] += value
        self.logger.debug(f"Counter {metric_name} incremented by {value}")
    
    def set_gauge(self, metric_name: str, value: float):
        """Set a gauge metric.
        
        Args:
            metric_name: Name of the metric
            value: Current value
        """
        self.gauges[metric_name] = value
        self.logger.debug(f"Gauge {metric_name} set to {value}")
    
    def record_timing(self, metric_name: str, duration: float):
        """Record a timing metric.
        
        Args:
            metric_name: Name of the metric
            duration: Duration in seconds
        """
        timestamp = datetime.utcnow()
        self.metrics[metric_name].append({
            "timestamp": timestamp,
            "value": duration
        })
        self.logger.debug(f"Timing {metric_name}: {duration:.3f}s")
    
    def get_counter(self, metric_name: str) -> int:
        """Get counter value.
        
        Args:
            metric_name: Name of the metric
            
        Returns:
            Current counter value
        """
        return self.counters.get(metric_name, 0)
    
    def get_gauge(self, metric_name: str) -> float:
        """Get gauge value.
        
        Args:
            metric_name: Name of the metric
            
        Returns:
            Current gauge value
        """
        return self.gauges.get(metric_name, 0.0)
    
    def get_timing_stats(self, metric_name: str) -> Dict[str, float]:
        """Get statistics for a timing metric.
        
        Args:
            metric_name: Name of the metric
            
        Returns:
            Dictionary with count, min, max, avg, p50, p95, p99
        """
        if metric_name not in self.metrics or not self.metrics[metric_name]:
            return {
                "count": 0,
                "min": 0.0,
                "max": 0.0,
                "avg": 0.0,
                "p50": 0.0,
                "p95": 0.0,
                "p99": 0.0
            }
        
        values = [m["value"] for m in self.metrics[metric_name]]
        values_sorted = sorted(values)
        count = len(values_sorted)
        
        return {
            "count": count,
            "min": min(values_sorted),
            "max": max(values_sorted),
            "avg": sum(values_sorted) / count,
            "p50": values_sorted[int(count * 0.5)] if count > 0 else 0.0,
            "p95": values_sorted[int(count * 0.95)] if count > 0 else 0.0,
            "p99": values_sorted[int(count * 0.99)] if count > 0 else 0.0
        }
    
    def get_all_metrics(self) -> Dict[str, any]:
        """Get all metrics summary.
        
        Returns:
            Dictionary with all metrics
        """
        uptime = (datetime.utcnow() - self.start_time).total_seconds()
        
        return {
            "uptime_seconds": uptime,
            "counters": dict(self.counters),
            "gauges": dict(self.gauges),
            "timings": {
                name: self.get_timing_stats(name)
                for name in self.metrics.keys()
            }
        }
    
    def reset(self):
        """Reset all metrics."""
        self.metrics.clear()
        self.counters.clear()
        self.gauges.clear()
        self.start_time = datetime.utcnow()
        self.logger.info("Metrics reset")


class RequestMetrics:
    """Context manager for tracking request metrics."""
    
    def __init__(self, metrics_collector: MetricsCollector, endpoint: str):
        """Initialize request metrics.
        
        Args:
            metrics_collector: Metrics collector instance
            endpoint: Endpoint name
        """
        self.metrics = metrics_collector
        self.endpoint = endpoint
        self.start_time = None
    
    def __enter__(self):
        """Start timing."""
        self.start_time = time.time()
        self.metrics.increment(f"requests.{self.endpoint}.total")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """End timing and record metrics."""
        duration = time.time() - self.start_time
        self.metrics.record_timing(f"requests.{self.endpoint}.duration", duration)
        
        if exc_type is not None:
            self.metrics.increment(f"requests.{self.endpoint}.errors")
        else:
            self.metrics.increment(f"requests.{self.endpoint}.success")
        
        return False


# Global metrics collector
_metrics_collector: Optional[MetricsCollector] = None


def get_metrics_collector() -> MetricsCollector:
    """Get the global metrics collector instance."""
    global _metrics_collector
    
    if _metrics_collector is None:
        _metrics_collector = MetricsCollector()
    
    return _metrics_collector
