package area

import (
	"math/big"

	"github.com/Miwm64/web_labs/server/internal/validate"
)

func Contains(p validate.Point) bool {
	x := big.NewRat(int64(p.X), 1)
	y := p.YValue
	r := p.RValue

	return inSquare(x, y, r) || inQuarterDisc(x, y, r) || inTriangle(x, y, r)
}

func inSquare(x, y, r *big.Rat) bool {
	minusR := new(big.Rat).Neg(r)
	return x.Cmp(minusR) >= 0 && x.Sign() <= 0 && y.Sign() >= 0 && y.Cmp(r) <= 0
}

func inQuarterDisc(x, y, r *big.Rat) bool {
	if x.Sign() < 0 || y.Sign() < 0 {
		return false
	}
	distance := new(big.Rat).Add(square(x), square(y))
	radius := new(big.Rat).Quo(r, big.NewRat(2, 1))
	return distance.Cmp(square(radius)) <= 0
}

func inTriangle(x, y, r *big.Rat) bool {
	if x.Sign() < 0 || y.Sign() > 0 {
		return false
	}
	return new(big.Rat).Sub(x, y).Cmp(r) <= 0
}

func square(v *big.Rat) *big.Rat {
	return new(big.Rat).Mul(v, v)
}
