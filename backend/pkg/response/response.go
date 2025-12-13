package response

// APIResponse standardizes HTTP responses.
type APIResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	ErrorCode string      `json:"error_code,omitempty"`
	Error     interface{} `json:"error,omitempty"`
}

// Error creates a standardized error payload.
func Error(code string, msg string) APIResponse {
	return APIResponse{
		Success:   false,
		ErrorCode: code,
		Error:     msg,
	}
}

// TODO: add pagination and metadata support in future phases.
