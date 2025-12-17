package notification

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const discordWebhookURL = "https://discord.com/api/webhooks/1450788972123914321/ySG_m2Nc-Gg0XIhYv9OVlxBswZMsG9v8i1myqSDjNGyJhcHOrSmWnlymIq5olMNVG1JT"

// DiscordNotifier sends OTP messages to a Discord webhook.
// TODO: Replace with SMS provider before production.
type DiscordNotifier struct {
	client *http.Client
}

// NewDiscordNotifier creates a Discord notifier with a short timeout.
func NewDiscordNotifier() *DiscordNotifier {
	return &DiscordNotifier{
		client: &http.Client{Timeout: 5 * time.Second},
	}
}

// SendOTP posts OTP payload to Discord webhook.
func (d *DiscordNotifier) SendOTP(ctx context.Context, phone string, otpCode string) error {
	payload := map[string]string{
		"content": fmt.Sprintf(
			"OTP for pickup\nPhone: %s\nOTP: %s\nExpires in 5 minutes",
			phone,
			otpCode,
		),
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, discordWebhookURL, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := d.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("discord webhook returned status %d", resp.StatusCode)
	}
	return nil
}
