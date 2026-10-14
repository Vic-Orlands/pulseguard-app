package pql

import (
	"fmt"
	"strconv"
	"strings"
	"unicode"
)

type Compiled struct {
	SQL  string
	Args []any
}

var columns = map[string]string{
	"type":           "type",
	"name":           "name",
	"provider":       "provider",
	"request_model":  "request_model",
	"response_model": "response_model",
	"status":         "status",
	"error_type":     "error_type",
	"user_id":        "user_id",
	"session_id":     "session_id",
	"environment":    "environment",
	"trace_id":       "trace_id",
	"span_id":        "span_id",
	"duration_ms":    "duration_ms",
	"total_cost":     "total_cost",
	"input_tokens":   "input_tokens",
	"output_tokens":  "output_tokens",
	"ttft_ms":        "ttft_ms",
	"http_status":    "http_status",
	"input":          "input",
	"output":         "output",
	"tool_name":      "tool_name",
	"agent_name":     "agent_name",
	"finish_reason":  "finish_reason",
	"start_time":     "start_time",
}

var funcs = map[string]string{
	"user_prompt": `if(startsWith(trimBoth(input), '['), JSONExtractString(arrayLast(x -> JSONExtractString(x, 'role') = 'user', JSONExtractArrayRaw(input)), 'content'), input)`,
	"assistant":   `if(startsWith(trimBoth(output), '['), JSONExtractString(arrayLast(x -> JSONExtractString(x, 'role') = 'assistant', JSONExtractArrayRaw(output)), 'content'), output)`,
	"turns":       `length(arrayFilter(x -> JSONExtractString(x, 'role') = 'user', JSONExtractArrayRaw(input)))`,
	"has_tool":    `if(type = 'tool' OR tool_name != '', 1, 0)`,
}

type stage struct {
	verb string
	rest string
}

func Compile(source string) (Compiled, error) {
	source = strings.TrimSpace(source)
	if source == "" {
		return detail(nil, nil, map[string]string{}, "", 100)
	}
	if len(source) > 2000 {
		return Compiled{}, fmt.Errorf("query is too long")
	}
	if unsafeSyntax(source) {
		return Compiled{}, fmt.Errorf("query contains unsupported syntax")
	}
	parts, err := splitPipes(source)
	if err != nil {
		return Compiled{}, err
	}
	var wheres []string
	var whereArgs []any
	extends := map[string]string{}
	var summarize string
	var group []string
	aliases := map[string]struct{}{}
	var order string
	limit := 100
	for _, part := range parts {
		st, err := parseStage(part)
		if err != nil {
			return Compiled{}, err
		}
		switch st.verb {
		case "where":
			clause, args, err := parseWhere(st.rest)
			if err != nil {
				return Compiled{}, err
			}
			wheres = append(wheres, clause)
			whereArgs = append(whereArgs, args...)
		case "extend":
			name, expr, err := parseExtend(st.rest)
			if err != nil {
				return Compiled{}, err
			}
			extends[name] = expr
		case "summarize":
			summarize, group, aliases, err = parseSummarize(st.rest, extends)
			if err != nil {
				return Compiled{}, err
			}
		case "sort":
			order, err = parseSort(st.rest, extends, aliases)
			if err != nil {
				return Compiled{}, err
			}
		case "limit":
			limit, err = strconv.Atoi(strings.TrimSpace(st.rest))
			if err != nil || limit < 1 || limit > 500 {
				return Compiled{}, fmt.Errorf("limit must be 1..500")
			}
		default:
			return Compiled{}, fmt.Errorf("unknown stage %s", st.verb)
		}
	}
	if summarize != "" {
		return aggregate(wheres, whereArgs, extends, summarize, group, order, limit)
	}
	return detail(wheres, whereArgs, extends, order, limit)
}

func detail(wheres []string, args []any, extends map[string]string, order string, limit int) (Compiled, error) {
	selects := []string{
		"trace_id", "span_id", "name", "type", "provider", "request_model", "status", "error_type",
		"user_id", "session_id", "duration_ms", "total_cost", "input_tokens", "output_tokens", "start_time",
	}
	for name, expr := range extends {
		selects = append(selects, expr+" AS "+name)
	}
	if order == "" {
		order = "start_time DESC"
	}
	return finish(strings.Join(selects, ", "), wheres, args, "", order, limit)
}

func aggregate(wheres []string, args []any, extends map[string]string, summarize string, group []string, order string, limit int) (Compiled, error) {
	inner := []string{"*"}
	for name, expr := range extends {
		inner = append(inner, expr+" AS "+name)
	}
	whereSQL, whereArgs := whereClause(wheres, args)
	sql := fmt.Sprintf(
		"SELECT %s FROM (SELECT %s FROM observations FINAL WHERE %s) GROUP BY %s",
		summarize,
		strings.Join(inner, ", "),
		whereSQL,
		strings.Join(group, ", "),
	)
	if order != "" {
		sql += " ORDER BY " + order
	}
	sql += fmt.Sprintf(" LIMIT %d", limit)
	return Compiled{SQL: sql, Args: whereArgs}, nil
}

func finish(selects string, wheres []string, args []any, extra string, order string, limit int) (Compiled, error) {
	whereSQL, whereArgs := whereClause(wheres, args)
	sql := fmt.Sprintf("SELECT %s FROM observations FINAL WHERE %s", selects, whereSQL)
	if extra != "" {
		sql += " " + extra
	}
	if order != "" {
		sql += " ORDER BY " + order
	}
	sql += fmt.Sprintf(" LIMIT %d", limit)
	return Compiled{SQL: sql, Args: whereArgs}, nil
}

func whereClause(wheres []string, args []any) (string, []any) {
	base := []string{"project_id = ?", "start_time >= ?", "start_time < ?"}
	base = append(base, wheres...)
	return strings.Join(base, " AND "), args
}

func splitPipes(source string) ([]string, error) {
	var parts []string
	var b strings.Builder
	quote := rune(0)
	for _, r := range source {
		if quote != 0 {
			b.WriteRune(r)
			if r == quote {
				quote = 0
			}
			continue
		}
		if r == '"' || r == '\'' {
			quote = r
			b.WriteRune(r)
			continue
		}
		if r == '|' {
			parts = append(parts, b.String())
			b.Reset()
			continue
		}
		b.WriteRune(r)
	}
	if quote != 0 {
		return nil, fmt.Errorf("unterminated string")
	}
	if strings.TrimSpace(b.String()) != "" {
		parts = append(parts, b.String())
	}
	return parts, nil
}

func parseStage(raw string) (stage, error) {
	fields := strings.Fields(strings.TrimSpace(raw))
	if len(fields) == 0 {
		return stage{}, fmt.Errorf("empty stage")
	}
	verb := strings.ToLower(fields[0])
	rest := strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(raw), fields[0]))
	return stage{verb: verb, rest: rest}, nil
}

func parseWhere(rest string) (string, []any, error) {
	chunks := splitAnd(rest)
	clauses := make([]string, 0, len(chunks))
	var args []any
	for _, chunk := range chunks {
		clause, arg, err := parseComparison(chunk)
		if err != nil {
			return "", nil, err
		}
		clauses = append(clauses, clause)
		if arg != nil {
			args = append(args, arg)
		}
	}
	return "(" + strings.Join(clauses, " AND ") + ")", args, nil
}

func splitAnd(rest string) []string {
	lower := strings.ToLower(rest)
	var parts []string
	start := 0
	quote := false
	for i := 0; i < len(rest); i++ {
		switch rest[i] {
		case '"', '\'':
			quote = !quote
		}
		if quote {
			continue
		}
		if i+5 <= len(lower) && lower[i:i+5] == " and " {
			parts = append(parts, rest[start:i])
			start = i + 5
			i += 4
		}
	}
	parts = append(parts, rest[start:])
	return parts
}

func parseComparison(raw string) (string, any, error) {
	raw = strings.TrimSpace(raw)
	ops := []string{">=", "<=", "!=", "contains", "=", ">", "<"}
	for _, op := range ops {
		idx := indexOp(raw, op)
		if idx < 0 {
			continue
		}
		left := strings.TrimSpace(raw[:idx])
		right := strings.TrimSpace(raw[idx+len(op):])
		col, ok := columns[left]
		if !ok {
			return "", nil, fmt.Errorf("unknown field %s", left)
		}
		lit, err := parseLiteral(right)
		if err != nil {
			return "", nil, err
		}
		switch op {
		case "contains":
			text, ok := lit.(string)
			if !ok {
				return "", nil, fmt.Errorf("contains expects a string")
			}
			return fmt.Sprintf("positionCaseInsensitive(%s, ?) > 0", col), text, nil
		case "=":
			return col + " = ?", lit, nil
		case "!=":
			return col + " != ?", lit, nil
		case ">", "<", ">=", "<=":
			return fmt.Sprintf("%s %s ?", col, op), lit, nil
		}
	}
	return "", nil, fmt.Errorf("expected a comparison")
}

func indexOp(raw, op string) int {
	quote := rune(0)
	for i := 0; i < len(raw); i++ {
		r := rune(raw[i])
		if quote != 0 {
			if r == quote {
				quote = 0
			}
			continue
		}
		if r == '"' || r == '\'' {
			quote = r
			continue
		}
		if strings.HasPrefix(raw[i:], op) {
			before := i == 0 || unicode.IsSpace(rune(raw[i-1]))
			after := i+len(op) == len(raw) || unicode.IsSpace(rune(raw[i+len(op)])) || op != "contains"
			if op == "contains" {
				after = i+len(op) == len(raw) || unicode.IsSpace(rune(raw[i+len(op)]))
			}
			if before && after {
				return i
			}
		}
	}
	return -1
}

func parseLiteral(raw string) (any, error) {
	raw = strings.TrimSpace(raw)
	if len(raw) >= 2 && (raw[0] == '"' || raw[0] == '\'') && raw[len(raw)-1] == raw[0] {
		return raw[1 : len(raw)-1], nil
	}
	if n, err := strconv.ParseInt(raw, 10, 64); err == nil {
		return n, nil
	}
	if n, err := strconv.ParseFloat(raw, 64); err == nil {
		return n, nil
	}
	return nil, fmt.Errorf("expected a literal")
}

func parseExtend(rest string) (string, string, error) {
	parts := strings.SplitN(rest, "=", 2)
	if len(parts) != 2 {
		return "", "", fmt.Errorf("extend expects name = function(field)")
	}
	name := strings.TrimSpace(parts[0])
	if !ident(name) || columns[name] != "" {
		return "", "", fmt.Errorf("invalid extend name %s", name)
	}
	call := strings.TrimSpace(parts[1])
	open := strings.IndexByte(call, '(')
	close := strings.LastIndexByte(call, ')')
	if open < 1 || close != len(call)-1 {
		return "", "", fmt.Errorf("extend expects a function call")
	}
	fn := call[:open]
	arg := strings.TrimSpace(call[open+1 : close])
	expr, ok := funcs[fn]
	if !ok {
		return "", "", fmt.Errorf("unknown function %s", fn)
	}
	if _, known := columns[arg]; !known {
		return "", "", fmt.Errorf("unknown field %s", arg)
	}
	return name, expr, nil
}

func parseSummarize(rest string, extends map[string]string) (string, []string, map[string]struct{}, error) {
	by := ""
	lower := strings.ToLower(rest)
	if idx := strings.LastIndex(lower, " by "); idx >= 0 {
		by = rest[idx+4:]
		rest = rest[:idx]
	}
	aggs := strings.Split(rest, ",")
	selects := make([]string, 0, len(aggs))
	aliases := map[string]struct{}{}
	for _, agg := range aggs {
		item, alias, err := parseAgg(strings.TrimSpace(agg), extends)
		if err != nil {
			return "", nil, nil, err
		}
		aliases[alias] = struct{}{}
		selects = append(selects, item)
	}
	var group []string
	if strings.TrimSpace(by) != "" {
		for _, field := range strings.Split(by, ",") {
			field = strings.TrimSpace(field)
			col, ok := resolve(field, extends, nil)
			if !ok {
				return "", nil, nil, fmt.Errorf("unknown field %s", field)
			}
			group = append(group, col)
			selects = append(selects, col)
		}
	}
	if len(group) == 0 {
		group = []string{"tuple()"}
	}
	return strings.Join(selects, ", "), group, aliases, nil
}

func parseAgg(raw string, extends map[string]string) (string, string, error) {
	parts := strings.SplitN(raw, "=", 2)
	if len(parts) != 2 {
		return "", "", fmt.Errorf("summarize expects name = agg()")
	}
	alias := strings.TrimSpace(parts[0])
	call := strings.TrimSpace(parts[1])
	if !ident(alias) {
		return "", "", fmt.Errorf("invalid aggregate name %s", alias)
	}
	open := strings.IndexByte(call, '(')
	close := strings.LastIndexByte(call, ')')
	if open < 1 || close != len(call)-1 {
		return "", "", fmt.Errorf("invalid aggregate %s", call)
	}
	fn := strings.ToLower(call[:open])
	arg := strings.TrimSpace(call[open+1 : close])
	switch fn {
	case "count":
		if arg != "" {
			return "", "", fmt.Errorf("count takes no field")
		}
		return "count() AS " + alias, alias, nil
	case "sum", "avg", "min", "max":
		col, ok := resolve(arg, extends, nil)
		if !ok {
			return "", "", fmt.Errorf("unknown field %s", arg)
		}
		return fmt.Sprintf("%s(%s) AS %s", fn, col, alias), alias, nil
	case "p95":
		col, ok := resolve(arg, extends, nil)
		if !ok {
			return "", "", fmt.Errorf("unknown field %s", arg)
		}
		return fmt.Sprintf("quantile(0.95)(%s) AS %s", col, alias), alias, nil
	default:
		return "", "", fmt.Errorf("unknown aggregate %s", fn)
	}
}

func parseSort(rest string, extends map[string]string, aliases map[string]struct{}) (string, error) {
	fields := strings.Fields(rest)
	if len(fields) == 0 || len(fields) > 2 {
		return "", fmt.Errorf("sort expects a field")
	}
	col, ok := resolve(fields[0], extends, aliases)
	if !ok {
		return "", fmt.Errorf("unknown field %s", fields[0])
	}
	dir := "ASC"
	if len(fields) == 2 {
		switch strings.ToLower(fields[1]) {
		case "desc":
			dir = "DESC"
		case "asc":
			dir = "ASC"
		default:
			return "", fmt.Errorf("sort direction must be asc or desc")
		}
	}
	return col + " " + dir, nil
}

func resolve(field string, extends map[string]string, aliases map[string]struct{}) (string, bool) {
	if _, ok := aliases[field]; ok {
		return field, true
	}
	if col, ok := columns[field]; ok {
		return col, true
	}
	if _, ok := extends[field]; ok {
		return field, true
	}
	return "", false
}

func unsafeSyntax(source string) bool {
	quote := byte(0)
	for i := 0; i < len(source); i++ {
		ch := source[i]
		if quote != 0 {
			if ch == quote {
				quote = 0
			}
			continue
		}
		if ch == '"' || ch == '\'' {
			quote = ch
			continue
		}
		if ch == ';' {
			return true
		}
		if ch == '-' && i+1 < len(source) && source[i+1] == '-' {
			return true
		}
		if ch == '/' && i+1 < len(source) && source[i+1] == '*' {
			return true
		}
	}
	return false
}

func ident(value string) bool {
	if value == "" {
		return false
	}
	for i, r := range value {
		if i == 0 && !unicode.IsLetter(r) {
			return false
		}
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) && r != '_' {
			return false
		}
	}
	return true
}
