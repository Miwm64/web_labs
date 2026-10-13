package validate

import (
	"fmt"
	"math/big"
	"regexp"
)

const maxLength = 20

type Point struct {
	X      int
	Y      string
	R      string
	YValue *big.Rat
	RValue *big.Rat
}

type field struct {
	label   string
	pattern *regexp.Regexp
	min     int64
	max     int64
	missing string
	format  string
}

var (
	fieldX = field{
		label:   "X",
		pattern: regexp.MustCompile(`^-?[0-9]$`),
		min:     -4,
		max:     4,
		missing: "Отметьте одно значение X.",
		format:  "X должно быть целым числом.",
	}
	fieldY = field{
		label:   "Y",
		pattern: regexp.MustCompile(`^-?[0-9]+(\.[0-9]+)?$`),
		min:     -3,
		max:     3,
		missing: "Заполните поле Y.",
		format:  "Y должно быть числом.",
	}
	fieldR = field{
		label:   "R",
		pattern: regexp.MustCompile(`^[0-9]+(\.[0-9]+)?$`),
		min:     2,
		max:     5,
		missing: "Заполните поле R.",
		format:  "R должно быть положительным числом.",
	}
)

func (f field) parse(raw string) (*big.Rat, string) {
	switch {
	case raw == "":
		return nil, f.missing
	case len(raw) > maxLength:
		return nil, fmt.Sprintf("%s — слишком длинное значение.", f.label)
	case !f.pattern.MatchString(raw):
		return nil, f.format
	}

	value, ok := new(big.Rat).SetString(raw)
	if !ok {
		return nil, f.format
	}
	if value.Cmp(big.NewRat(f.min, 1)) < 0 || value.Cmp(big.NewRat(f.max, 1)) > 0 {
		return nil, fmt.Sprintf("%s должно быть от %d до %d.", f.label, f.min, f.max)
	}
	return value, ""
}

func Parse(x, y, r string) (Point, map[string]string) {
	errs := make(map[string]string)

	xValue, message := fieldX.parse(x)
	if message != "" {
		errs["x"] = message
	}
	yValue, message := fieldY.parse(y)
	if message != "" {
		errs["y"] = message
	}
	rValue, message := fieldR.parse(r)
	if message != "" {
		errs["r"] = message
	}

	if len(errs) > 0 {
		return Point{}, errs
	}
	return Point{
		X:      int(xValue.Num().Int64()),
		Y:      y,
		R:      r,
		YValue: yValue,
		RValue: rValue,
	}, nil
}
