package logger

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

type entry struct {
	EventDate     string `json:"eventDate"`
	Level         string `json:"level"`
	Msg           string `json:"msg"`
	Info          string `json:"info"`
	URL           string `json:"url"`
	CodeLine      string `json:"codeLine"`
	TransactionID string `json:"transactionId"`
}

func Info(ctx context.Context, msg string, infoMap map[string]interface{}, url string) {
	write(ctx, "INFO", msg, infoMap, url)
}

func Warn(ctx context.Context, msg string, infoMap map[string]interface{}, url string) {
	write(ctx, "WARN", msg, infoMap, url)
}

func Error(ctx context.Context, msg string, infoMap map[string]interface{}, url string) {
	write(ctx, "ERROR", msg, infoMap, url)
}

func write(ctx context.Context, level, msg string, infoMap map[string]interface{}, url string) {
	initLogger()
	info := encodeInfo(infoMap)
	resolvedCodeLine := resolveCodeLine()
	logEntry := entry{
		EventDate:     time.Now().UTC().Format(time.RFC3339),
		Level:         level,
		Msg:           msg,
		Info:          info,
		URL:           url,
		CodeLine:      resolvedCodeLine,
		TransactionID: transactionID(ctx),
	}

	payload, err := json.Marshal(logEntry)
	if err != nil {
		fallback := entry{
			EventDate:     time.Now().UTC().Format(time.RFC3339),
			Level:         "ERROR",
			Msg:           "logger marshal failed",
			Info:          fmt.Sprintf(`{"error":"%v"}`, err),
			URL:           url,
			CodeLine:      resolvedCodeLine,
			TransactionID: transactionID(ctx),
		}
		fallbackPayload, _ := json.Marshal(fallback)
		log.Print(string(fallbackPayload))
		return
	}
	log.Print(string(payload))
}

func encodeInfo(infoMap map[string]interface{}) string {
	if infoMap == nil {
		return "{}"
	}
	encoded, err := json.Marshal(infoMap)
	if err != nil {
		return fmt.Sprintf("marshal_error: %v", err)
	}
	return string(encoded)
}

var loggerInitOnce sync.Once

func initLogger() {
	loggerInitOnce.Do(func() {
		log.SetFlags(0)
		log.SetOutput(os.Stdout)
	})
}

func resolveCodeLine() string {
	file, line := callerFileLine()
	if file == "" || line == 0 {
		return "unknown:0"
	}
	return fmt.Sprintf("%s:%d", file, line)
}

func callerFileLine() (string, int) {
	for depth := 2; depth <= 8; depth++ {
		_, file, line, ok := runtime.Caller(depth)
		if !ok {
			continue
		}
		if !isLoggerFile(file) {
			return normalizeFilePath(file), line
		}
	}
	return "", 0
}

func isLoggerFile(file string) bool {
	return strings.HasSuffix(filepath.ToSlash(file), "backend/pkg/logger/logger.go")
}

func normalizeFilePath(file string) string {
	normalized := filepath.ToSlash(file)
	const anchor = "/backend/"
	idx := strings.LastIndex(normalized, anchor)
	if idx == -1 {
		return normalized
	}
	return strings.TrimPrefix(normalized[idx:], "/")
}

type transactionIDKey struct{}

func WithTransactionID(ctx context.Context, id string) context.Context {
	if ctx == nil {
		ctx = context.Background()
	}
	return context.WithValue(ctx, transactionIDKey{}, id)
}

func transactionID(ctx context.Context) string {
	if ctx == nil {
		return "unknown"
	}
	value, ok := ctx.Value(transactionIDKey{}).(string)
	if !ok || value == "" {
		return "unknown"
	}
	return value
}
