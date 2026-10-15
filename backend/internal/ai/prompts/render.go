package prompts

import (
	"fmt"
	"regexp"
	"sort"
	"strings"
)

var placeholder = regexp.MustCompile(`\{\{\s*([A-Za-z0-9_]+)\s*\}\}`)

func Render(template string, vars map[string]string) (string, error) {
	missing := map[string]struct{}{}
	rendered := placeholder.ReplaceAllStringFunc(template, func(match string) string {
		name := placeholder.FindStringSubmatch(match)[1]
		value, ok := vars[name]
		if !ok {
			missing[name] = struct{}{}
			return match
		}
		return value
	})
	if len(missing) == 0 {
		return rendered, nil
	}
	names := make([]string, 0, len(missing))
	for name := range missing {
		names = append(names, name)
	}
	sort.Strings(names)
	return "", fmt.Errorf("missing variables: %s", strings.Join(names, ", "))
}
