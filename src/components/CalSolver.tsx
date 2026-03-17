import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TARGET = 152399025;

type Op = "+" | "-" | "×" | "÷" | null;

const CalSolver = () => {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Op>(null);
  const [waitingForSecond, setWaitingForSecond] = useState(false);
  const [solved, setSolved] = useState(false);
  const [error, setError] = useState(false);

  const handleNumber = useCallback((num: string) => {
    if (waitingForSecond) {
      setDisplay(num);
      setWaitingForSecond(false);
    } else {
      setDisplay(prev => prev === "0" ? num : (prev.length < 15 ? prev + num : prev));
    }
  }, [waitingForSecond]);

  const handleOperator = useCallback((op: Op) => {
    const current = parseFloat(display);
    if (firstOperand !== null && !waitingForSecond) {
      const result = calculate(firstOperand, current, operator);
      setDisplay(String(result));
      setFirstOperand(result);
    } else {
      setFirstOperand(current);
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
    
    if (result === TARGET) {
      setDisplay(String(result));
      setTimeout(() => setSolved(true), 600);
    } else {
      setDisplay(String(result));
      setError(true);
      setTimeout(() => {
        setError(false);
        setDisplay("0");
        setFirstOperand(null);
        setOperator(null);
      }, 800);
    }
    
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecond(false);
  }, [display, firstOperand, operator]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecond(false);
  }, []);

  const keys = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  const handleKey = (key: string) => {
    if (solved) return;
    switch (key) {
      case "C": handleClear(); break;
      case "±": setDisplay(prev => prev.startsWith("-") ? prev.slice(1) : "-" + prev); break;
      case "%": setDisplay(prev => String(parseFloat(prev) / 100)); break;
      case "÷": case "×": case "-": case "+": handleOperator(key as Op); break;
      case "=": handleEquals(); break;
      case ".": setDisplay(prev => prev.includes(".") ? prev : prev + "."); break;
      default: handleNumber(key); break;
    }
  };

  const isOperator = (key: string) => ["÷", "×", "-", "+"].includes(key);

  return (
    <div className="w-[320px] font-mono relative">
      {/* Header */}
      <div className="mb-4 px-1">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 font-semibold">
          Input Required.
        </p>
        <p className="text-[10px] text-muted-foreground/40 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Product of 12345 × 12345 to release latch.
        </p>
      </div>

      {/* Display */}
      <div
        className="relative h-24 w-full rounded-sm mb-6 flex items-center justify-end px-4 overflow-hidden"
        style={{
          background: "hsl(142 70% 5% / 0.1)",
          border: "1px solid hsl(142 76% 45% / 0.2)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display + String(error)}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1, ease: [0.19, 1, 0.22, 1] }}
            className="text-4xl tracking-tighter tabular-nums"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: error ? "hsl(0 84% 60%)" : "hsl(142 76% 45%)",
              textShadow: error
                ? "0 0 12px rgba(239,68,68,0.5)"
                : "0 0 8px rgba(16,185,129,0.4)",
            }}
          >
            {display}
          </motion.span>
        </AnimatePresence>
        {operator && (
          <span
            className="absolute top-2 right-4 text-xs tabular-nums"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(142 76% 45% / 0.4)",
            }}
          >
            {firstOperand} {operator}
          </span>
        )}
      </div>

      <AnimatePresence>
        {!solved ? (
          <motion.div
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Keypad */}
            <div className="grid grid-cols-4 gap-px rounded-sm overflow-hidden" style={{ border: "1px solid hsl(240 5% 15%)" }}>
              {keys.flat().map((key, i) => {
                const isZero = key === "0";
                return (
                  <motion.button
                    key={key + i}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => handleKey(key)}
                    className={`
                      h-14 flex items-center justify-center text-lg font-medium select-none
                      transition-colors duration-75
                      ${isZero ? "col-span-2" : ""}
                      ${isOperator(key) || key === "=" ? "active:brightness-125" : "active:brightness-150"}
                    `}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: isOperator(key) || key === "="
                        ? "hsl(142 76% 45% / 0.15)"
                        : key === "C" || key === "±" || key === "%"
                        ? "hsl(0 0% 14%)"
                        : "hsl(0 0% 10%)",
                      color: isOperator(key) || key === "="
                        ? "hsl(142 76% 45%)"
                        : key === "C" || key === "±" || key === "%"
                        ? "hsl(0 0% 80%)"
                        : "hsl(0 0% 70%)",
                      borderTop: "1px solid hsl(0 0% 15%)",
                    }}
                  >
                    {key}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: 0.5 }}
              className="text-xs uppercase tracking-[0.4em] font-semibold"
              style={{ color: "hsl(142 76% 45%)" }}
            >
              Access Granted
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase"
            >
              Decrypting payload...
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="mt-8 p-6 rounded-sm text-center"
              style={{
                background: "hsl(142 70% 5% / 0.15)",
                border: "1px solid hsl(142 76% 45% / 0.2)",
              }}
            >
              <p className="text-sm" style={{ color: "hsl(142 76% 45%)", fontFamily: "'JetBrains Mono', monospace" }}>
                🔓 VAULT UNLOCKED
              </p>
              <p className="text-xs text-muted-foreground/40 mt-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                152,399,025
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalSolver;
