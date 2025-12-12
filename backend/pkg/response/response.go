package response

// APIResponse standardizes HTTP responses.
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

// TODO: add pagination and metadata support in future phases.
