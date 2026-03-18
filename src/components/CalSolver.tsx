import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Op = "+" | "-" | "×" | "÷" | null;

const CalSolver = ({ onUnlock }: { onUnlock: () => void }) => {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Op>(null);
  const [waitingForSecond, setWaitingForSecond] = useState(false);
  const [expression, setExpression] = useState("");
  

  const handleNumber = useCallback((num: string) => {
    if (waitingForSecond) {
      setDisplay(num);
      setWaitingForSecond(false);
    } else {
      setDisplay(prev => prev === "0" ? num : (prev.length < 12 ? prev + num : prev));
    }
  }, [waitingForSecond]);

  const handleOperator = useCallback((op: Op) => {
    const current = parseFloat(display);
    if (firstOperand !== null && !waitingForSecond) {
      const result = calculate(firstOperand, current, operator);
      setDisplay(String(result));
      setFirstOperand(result);
      setExpression(`${result} ${op}`);
    } else {
      setFirstOperand(current);
      setExpression(`${current} ${op}`);
    }
    setOperator(op);
    setWaitingForSecond(true);
  }, [display, firstOperand, operator, waitingForSecond]);

  const calculate = (a: number, b: number, op: Op): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = useCallback(() => {
    if (firstOperand === null || operator === null) return;
    const current = parseFloat(display);
    const result = calculate(firstOperand, current, operator);
    setDisplay(String(result));
    setExpression("");
    
    if (result === 152399025) {
      setTimeout(() => onUnlock(), 400);
    }
    
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecond(false);
  }, [display, firstOperand, operator, onUnlock]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecond(false);
    setExpression("");
  }, []);

  const handleKey = (key: string) => {
    switch (key) {
      case "AC": handleClear(); break;
      case "±": setDisplay(prev => prev.startsWith("-") ? prev.slice(1) : prev === "0" ? prev : "-" + prev); break;
      case "%": setDisplay(prev => String(parseFloat(prev) / 100)); break;
      case "÷": case "×": case "-": case "+": handleOperator(key as Op); break;
      case "=": handleEquals(); break;
      case ".": setDisplay(prev => prev.includes(".") ? prev : prev + "."); break;
      default: handleNumber(key); break;
    }
  };

  const keys = [
    ["AC", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  const isOp = (k: string) => ["÷", "×", "-", "+"].includes(k);
  const isFunc = (k: string) => ["AC", "±", "%"].includes(k);
  const isActiveOp = (k: string) => isOp(k) && operator === k && waitingForSecond;

  return (
    <div className="w-full max-w-[400px] mx-auto px-2">
      {/* Display */}
      <div
        className="rounded-2xl px-6 py-5 mb-3"
        style={{ background: "hsl(var(--calc-display))" }}
      >
        <div className="text-right min-h-[24px]">
          <span className="text-sm opacity-50" style={{ color: "hsl(var(--calc-display-text))" }}>
            {expression || "\u00A0"}
          </span>
        </div>
        <div className="text-right mt-1 overflow-hidden">
          <motion.span
            key={display}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="font-display font-semibold tabular-nums"
            style={{
              color: "hsl(var(--calc-display-text))",
              fontSize: display.length > 9 ? "28px" : display.length > 7 ? "36px" : "44px",
              letterSpacing: "-0.02em",
            }}
          >
            {display}
          </motion.span>
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2">
        {keys.map((row, ri) =>
          row.map((key) => {
            const isZero = key === "0";
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.08 }}
                onClick={() => handleKey(key)}
                className={`
                  h-[64px] rounded-2xl text-xl font-medium select-none
                  flex items-center justify-center
                  transition-colors duration-100
                  ${isZero ? "col-span-2" : ""}
                `}
                style={{
                  background: isActiveOp(key)
                    ? "hsl(var(--calc-display-text))"
                    : isOp(key) || key === "="
                    ? "hsl(var(--calc-op))"
                    : isFunc(key)
                    ? "hsl(var(--calc-func))"
                    : "hsl(var(--calc-key))",
                  color: isActiveOp(key)
                    ? "hsl(var(--calc-op))"
                    : isOp(key) || key === "="
                    ? "hsl(var(--calc-op-text))"
                    : isFunc(key)
                    ? "hsl(var(--calc-func-text))"
                    : "hsl(var(--calc-key-text))",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {key}
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CalSolver;
