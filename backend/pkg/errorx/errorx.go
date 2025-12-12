package errorx

// Error represents a typed application error for API responses and logging.
type Error struct {
	Code    string
	Message string
}

func (e Error) Error() string {
	if e.Message != "" {
		return e.Message
	}
	return e.Code
}

// TODO: extend with cause wrapping and categorization in future phases.
