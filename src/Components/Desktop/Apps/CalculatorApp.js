import React, { useState } from 'react';
import Calculator from '../../Utilities/Calculator.js';
import { Calculator as CalcIcon, BookOpen, Zap, TrendingUp } from 'lucide-react';

// Standard Calculator
const StandardCalculator = () => {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState(null);
    const [operation, setOperation] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [memory, setMemory] = useState(0);

    const inputDigit = (digit) => {
        if (waitingForOperand) {
            setDisplay(String(digit));
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? String(digit) : display + digit);
        }
    };

    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
            return;
        }
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
    };

    const handleDelete = () => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1));
        } else {
            setDisplay('0');
        }
    };

    const handleFunction = (func) => {
        const val = parseFloat(display);
        let result;
        switch (func) {
            case 'sqrt': result = Math.sqrt(val); break;
            case 'squared': result = val * val; break;
            case 'cbrt': result = Math.cbrt(val); break;
            case 'inverse': result = 1 / val; break;
            case 'percent': result = val / 100; break;
            default: result = val;
        }
        setDisplay(String(result.toFixed(8)));
        setWaitingForOperand(true);
    };

    const performOperation = (nextOperation) => {
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setPreviousValue(inputValue);
        } else if (operation) {
            const currentValue = previousValue || 0;
            let result;

            switch (operation) {
                case '+': result = currentValue + inputValue; break;
                case '-': result = currentValue - inputValue; break;
                case '×': result = currentValue * inputValue; break;
                case '÷': result = inputValue !== 0 ? currentValue / inputValue : 'Error'; break;
                default: result = inputValue;
            }

            setDisplay(String(result));
            setPreviousValue(result);
        }

        setWaitingForOperand(true);
        setOperation(nextOperation);
    };

    const calculate = () => {
        if (operation && previousValue !== null) {
            performOperation(null);
            setOperation(null);
            setPreviousValue(null);
        }
    };

    const handleMemory = (action) => {
        const val = parseFloat(display);
        switch (action) {
            case 'clear':
                setMemory(0);
                break;
            case 'recall':
                setDisplay(String(memory));
                setWaitingForOperand(true);
                break;
            case 'add':
                setMemory(memory + val);
                setWaitingForOperand(true);
                break;
            case 'subtract':
                setMemory(memory - val);
                setWaitingForOperand(true);
                break;
            case 'store':
                setMemory(val);
                setWaitingForOperand(true);
                break;
            default:
                break;
        }
    };

    const handleButton = (btn) => {
        if (btn >= '0' && btn <= '9') inputDigit(parseInt(btn));
        else if (btn === '.') inputDecimal();
        else if (btn === 'C') clear();
        else if (btn === 'CE') clear();
        else if (btn === 'DEL') handleDelete();
        else if (btn === '±') setDisplay(String(parseFloat(display) * -1));
        else if (btn === '%') handleFunction('percent');
        else if (btn === '1/x') handleFunction('inverse');
        else if (btn === 'x²') handleFunction('squared');
        else if (btn === '√x') handleFunction('sqrt');
        else if (btn === '∛√') handleFunction('cbrt');
        else if (btn === '=') calculate();
        else if (['+', '-', '×', '÷'].includes(btn)) performOperation(btn);
    };

    const isOperator = (btn) => ['+', '-', '×', '÷'].includes(btn);
    const isFunction = (btn) => ['1/x', 'x²', '√x', '∛√'].includes(btn);
    const isMemory = (btn) => ['MC', 'MR', 'M+', 'M-', 'MS'].includes(btn);

    return (
        <div style={{ paddingTop: '50px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '16px', color: '#fff', height: '100%', overflow: 'auto', backgroundColor: 'transparent' }}>
            {/* Memory Indicator */}
            {memory !== 0 && (
                <div style={{ fontSize: '11px', color: '#4d96ff', marginBottom: '8px', fontWeight: '600' }}>
                    Memory: {memory.toFixed(2)}
                </div>
            )}

            {/* Display */}
            <div style={{
                marginBottom: '16px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.4)',
                textAlign: 'right'
            }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', wordBreak: 'break-all', minHeight: '40px' }}>
                    {display}
                </div>
            </div>

            {/* Memory Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '12px' }}>
                {['MC', 'MR', 'M+', 'M-', 'MS'].map(btn => (
                    <button
                        key={btn}
                        onClick={() => {
                            if (btn === 'MC') handleMemory('clear');
                            else if (btn === 'MR') handleMemory('recall');
                            else if (btn === 'M+') handleMemory('add');
                            else if (btn === 'M-') handleMemory('subtract');
                            else if (btn === 'MS') handleMemory('store');
                        }}
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            backgroundColor: '#2a2a2a',
                            color: '#aaa',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        {btn}
                    </button>
                ))}
            </div>

            {/* Function Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '12px' }}>
                {['%', 'CE', 'C', 'M→', 'DEL'].map(btn => (
                    <button
                        key={btn}
                        onClick={() => handleButton(btn)}
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            backgroundColor: btn === 'C' || btn === 'CE' ? 'rgba(255,100,100,0.2)' : '#2a2a2a',
                            color: btn === 'C' || btn === 'CE' ? '#ff6b6b' : '#aaa',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        {btn === 'DEL' ? '⌫' : btn}
                    </button>
                ))}
            </div>

            {/* Scientific Functions Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '12px' }}>
                {['1/x', 'x²', '∛√', '√x', '÷'].map(btn => (
                    <button
                        key={btn}
                        onClick={() => handleButton(btn)}
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            backgroundColor: isOperator(btn) ? '#4d96ff' : '#2a2a2a',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        {btn}
                    </button>
                ))}
            </div>

            {/* Number Pad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {/* Row 1 */}
                {['7', '8', '9', '×', null].map(btn => (
                    btn === null ? (
                        <div key={`spacer-1`} />
                    ) : (
                        <button
                            key={btn}
                            onClick={() => handleButton(btn)}
                            style={{
                                padding: '12px',
                                borderRadius: '6px',
                                backgroundColor: isOperator(btn) ? '#4d96ff' : '#3a3a3a',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                hover: { backgroundColor: '#4a4a4a' }
                            }}
                        >
                            {btn}
                        </button>
                    )
                ))}

                {/* Row 2 */}
                {['4', '5', '6', '−', null].map(btn => (
                    btn === null ? (
                        <div key={`spacer-2`} />
                    ) : (
                        <button
                            key={btn}
                            onClick={() => handleButton(btn)}
                            style={{
                                padding: '12px',
                                borderRadius: '6px',
                                backgroundColor: isOperator(btn) ? '#4d96ff' : '#3a3a3a',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                        >
                            {btn}
                        </button>
                    )
                ))}

                {/* Row 3 */}
                {['1', '2', '3', '+', null].map(btn => (
                    btn === null ? (
                        <div key={`spacer-3`} />
                    ) : (
                        <button
                            key={btn}
                            onClick={() => handleButton(btn)}
                            style={{
                                padding: '12px',
                                borderRadius: '6px',
                                backgroundColor: isOperator(btn) ? '#4d96ff' : '#3a3a3a',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                        >
                            {btn}
                        </button>
                    )
                ))}

                {/* Row 4 */}
                {['0', '.', '='].map((btn, idx) => (
                    <button
                        key={btn}
                        onClick={() => handleButton(btn)}
                        style={{
                            padding: '12px',
                            borderRadius: '6px',
                            backgroundColor: btn === '=' ? '#4d96ff' : '#3a3a3a',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            gridColumn: btn === '0' ? 'span 2' : 'span 1'
                        }}
                    >
                        {btn}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Scientific Calculator
const ScientificCalculator = () => {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState(null);
    const [operation, setOperation] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [angleMode, setAngleMode] = useState('deg');

    const inputDigit = (digit) => {
        if (waitingForOperand) {
            setDisplay(String(digit));
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? String(digit) : display + digit);
        }
    };

    const handleFunction = (func) => {
        const val = parseFloat(display);
        let result;
        const rad = angleMode === 'deg' ? val * (Math.PI / 180) : val;

        switch (func) {
            case 'sin': result = Math.sin(rad); break;
            case 'cos': result = Math.cos(rad); break;
            case 'tan': result = Math.tan(rad); break;
            case 'log': result = Math.log10(val); break;
            case 'ln': result = Math.log(val); break;
            case 'sqrt': result = Math.sqrt(val); break;
            case 'squared': result = val * val; break;
            case 'inverse': result = 1 / val; break;
            case 'percent': result = val / 100; break;
            default: result = val;
        }
        setDisplay(String(result.toFixed(8)));
        setWaitingForOperand(true);
    };

    const buttons = [
        ['sin', 'cos', 'tan', '÷'],
        ['log', 'ln', 'π', '×'],
        ['7', '8', '9', '-'],
        ['4', '5', '6', '+'],
        ['1', '2', '3', '='],
        ['0', '.', 'C']
    ];

    const handleButton = (btn) => {
        if (btn >= '0' && btn <= '9') inputDigit(parseInt(btn));
        else if (btn === 'C') {
            setDisplay('0');
            setPreviousValue(null);
            setOperation(null);
            setWaitingForOperand(false);
        } else if (btn === 'π') {
            setDisplay(String(Math.PI.toFixed(8)));
            setWaitingForOperand(true);
        } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'squared', 'inverse', 'percent'].includes(btn)) {
            handleFunction(btn);
        } else if (['+', '-', '×', '÷'].includes(btn)) {
            const val = parseFloat(display);
            if (previousValue !== null && operation) {
                let result;
                switch (operation) {
                    case '+': result = previousValue + val; break;
                    case '-': result = previousValue - val; break;
                    case '×': result = previousValue * val; break;
                    case '÷': result = val !== 0 ? previousValue / val : 'Error'; break;
                    default: result = val;
                }
                setDisplay(String(result));
                setPreviousValue(result);
            } else {
                setPreviousValue(val);
            }
            setOperation(btn);
            setWaitingForOperand(true);
        } else if (btn === '=') {
            if (operation && previousValue !== null) {
                const val = parseFloat(display);
                let result;
                switch (operation) {
                    case '+': result = previousValue + val; break;
                    case '-': result = previousValue - val; break;
                    case '×': result = previousValue * val; break;
                    case '÷': result = val !== 0 ? previousValue / val : 'Error'; break;
                    default: result = val;
                }
                setDisplay(String(result));
                setPreviousValue(null);
                setOperation(null);
                setWaitingForOperand(true);
            }
        }
    };

    return (
        <div style={{ padding: '20px', color: '#fff' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Scientific Calculator</h3>
                <button
                    onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#4d96ff',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    {angleMode.toUpperCase()}
                </button>
            </div>

            <div style={{ marginBottom: '15px', padding: '15px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'right', wordBreak: 'break-all' }}>
                    {display}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {buttons.flat().map((btn, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleButton(btn)}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: ['sin', 'cos', 'tan', 'log', 'ln', 'π'].includes(btn) ? 'rgba(100,200,255,0.3)' : '#4d96ff',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px'
                        }}
                    >
                        {btn}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Programmer Calculator
const ProgrammerCalculator = () => {
    const [value, setValue] = useState('0');
    const [base, setBase] = useState(10);

    const handleInput = (num) => {
        if (value === '0') setValue(String(num));
        else setValue(value + num);
    };

    const convert = (fromBase, toBase) => {
        try {
            const decimal = parseInt(value, fromBase);
            return decimal.toString(toBase).toUpperCase();
        } catch {
            return 'Error';
        }
    };

    const decimal = parseInt(value, base);

    return (
        <div style={{ padding: '20px', color: '#fff' }}>
            <h3 style={{ marginBottom: '15px' }}>Programmer Calculator</h3>

            <div style={{ marginBottom: '15px', padding: '15px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>Input (Base {base})</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', wordBreak: 'break-all' }}>{value}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {[
                    { name: 'Binary', base: 2 },
                    { name: 'Octal', base: 8 },
                    { name: 'Decimal', base: 10 },
                    { name: 'Hexadecimal', base: 16 }
                ].map(b => (
                    <div key={b.base} style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(77,150,255,0.1)', border: base === b.base ? '2px solid #4d96ff' : '1px solid transparent' }}>
                        <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>{b.name}</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            {convert(base, b.base)}
                        </div>
                        <button
                            onClick={() => {
                                setBase(b.base);
                                setValue(convert(base, b.base) || '0');
                            }}
                            style={{
                                marginTop: '6px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: '#4d96ff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Use
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setValue('0')}
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '6px',
                    backgroundColor: '#ff6b6b',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                }}
            >
                Clear
            </button>
        </div>
    );
};

// Date Calculator
const DateCalculator = () => {
    const [date1, setDate1] = useState(new Date().toISOString().split('T')[0]);
    const [date2, setDate2] = useState(new Date().toISOString().split('T')[0]);
    const [calcMode, setCalcMode] = useState('difference');

    const getDayDifference = () => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diff = Math.abs(d2 - d1);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        return { days, weeks, months, years };
    };

    const getAge = () => {
        const d1 = new Date(date1);
        const today = new Date();
        let age = today.getFullYear() - d1.getFullYear();
        const monthDiff = today.getMonth() - d1.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d1.getDate())) {
            age--;
        }
        const days = Math.abs(today - d1) % (1000 * 60 * 60 * 24 * 365);
        return age;
    };

    const diff = getDayDifference();

    return (
        <div style={{ padding: '20px', color: '#fff' }}>
            <h3 style={{ marginBottom: '15px' }}>Date Calculator</h3>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#aaa' }}>Date 1:</label>
                <input
                    type="date"
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '14px'
                    }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#aaa' }}>Date 2:</label>
                <input
                    type="date"
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '14px'
                    }}
                />
            </div>

            {calcMode === 'difference' && (
                <div style={{ backgroundColor: 'rgba(77,150,255,0.15)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(77,150,255,0.3)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#aaa' }}>Days</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{diff.days}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#aaa' }}>Weeks</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{diff.weeks}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#aaa' }}>Months</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{diff.months}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#aaa' }}>Years</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{diff.years}</div>
                        </div>
                    </div>
                </div>
            )}

            {calcMode === 'age' && (
                <div style={{ backgroundColor: 'rgba(77,150,255,0.15)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(77,150,255,0.3)', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>Age from {date1}</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{getAge()}</div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>years old</div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                    onClick={() => setCalcMode('difference')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: calcMode === 'difference' ? '#4d96ff' : 'rgba(77,150,255,0.3)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Difference
                </button>
                <button
                    onClick={() => setCalcMode('age')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: calcMode === 'age' ? '#4d96ff' : 'rgba(77,150,255,0.3)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Age
                </button>
            </div>
        </div>
    );
};

// Dictionary Page
const DictionaryPage = () => {
    const [searchWord, setSearchWord] = useState('');
    const [definition, setDefinition] = useState(null);
    const [error, setError] = useState(null);

    const dictionaryData = {
        'hello': { definition: 'A greeting or expression of goodwill', partOfSpeech: 'noun' },
        'awesome': { definition: 'Extremely good or impressive', partOfSpeech: 'adjective' },
        'code': { definition: 'A system of rules or signals', partOfSpeech: 'noun' },
        'function': { definition: 'Purpose or intended use', partOfSpeech: 'noun' },
        'variable': { definition: 'A symbol representing a value that can change', partOfSpeech: 'noun' },
        'loop': { definition: 'A repeating sequence of instructions', partOfSpeech: 'noun' },
        'array': { definition: 'An ordered collection of elements', partOfSpeech: 'noun' },
        'object': { definition: 'An entity with properties and methods', partOfSpeech: 'noun' },
        'algorithm': { definition: 'Step-by-step procedure for solving a problem', partOfSpeech: 'noun' },
        'debug': { definition: 'To identify and remove errors in code', partOfSpeech: 'verb' },
    };

    const handleSearch = () => {
        if (!searchWord.trim()) {
            setError('Please enter a word');
            setDefinition(null);
            return;
        }

        const word = searchWord.toLowerCase().trim();
        if (dictionaryData[word]) {
            setDefinition({ word, ...dictionaryData[word] });
            setError(null);
        } else {
            setError(`No definition found for "${searchWord}"`);
            setDefinition(null);
        }
    };

    return (
        <div style={{ padding: '20px', color: '#fff', height: '100%', overflow: 'auto' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>Dictionary</h3>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Enter a word..."
                    style={{
                        flex: 1,
                        padding: '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '14px'
                    }}
                />
                <button
                    onClick={handleSearch}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        backgroundColor: '#4d96ff',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}
                >
                    Search
                </button>
            </div>

            {error && <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,100,100,0.2)', color: '#ffcccc', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

            {definition && (
                <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: 'rgba(77,150,255,0.15)', border: '1px solid rgba(77,150,255,0.3)', marginBottom: '15px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{definition.word}</div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>{definition.partOfSpeech}</div>
                    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{definition.definition}</div>
                </div>
            )}
        </div>
    );
};

// Unit Converter
const UnitConverter = () => {
    const [inputValue, setInputValue] = useState('');
    const [inputUnit, setInputUnit] = useState('meters');
    const [outputUnit, setOutputUnit] = useState('feet');
    const [category, setCategory] = useState('length');
    const [result, setResult] = useState('');

    const converters = {
        length: {
            name: 'Length',
            units: { meters: 1, feet: 3.28084, inches: 39.3701, kilometers: 0.001, miles: 0.000621371, centimeters: 100, millimeters: 1000 }
        },
        weight: {
            name: 'Weight',
            units: { kilograms: 1, grams: 1000, pounds: 2.20462, ounces: 35.274, tons: 0.001 }
        },
        volume: {
            name: 'Volume',
            units: { liters: 1, milliliters: 1000, gallons: 0.264172, pints: 2.11338, cups: 4.22675 }
        },
        temperature: {
            name: 'Temperature',
            units: { celsius: 'custom', fahrenheit: 'custom', kelvin: 'custom' }
        },
        energy: {
            name: 'Energy',
            units: { joules: 1, kilojoules: 0.001, calories: 0.239006, kilocalories: 0.000239006, watt_hours: 0.000277778 }
        },
        area: {
            name: 'Area',
            units: { square_meters: 1, square_feet: 10.7639, square_kilometers: 1e-6, square_miles: 3.861e-7, hectares: 0.0001 }
        },
        speed: {
            name: 'Speed',
            units: { meters_per_second: 1, kilometers_per_hour: 3.6, miles_per_hour: 2.23694, knots: 1.94384 }
        },
        time: {
            name: 'Time',
            units: { seconds: 1, minutes: 0.0166667, hours: 0.000277778, days: 0.0000115741, weeks: 0.00000165344 }
        },
        pressure: {
            name: 'Pressure',
            units: { pascals: 1, kilopascals: 0.001, bars: 1e-5, psi: 0.000145038, atmospheres: 9.86923e-6 }
        },
        angle: {
            name: 'Angle',
            units: { degrees: 1, radians: Math.PI / 180, gradians: 1.11111 }
        }
    };

    const handleConvert = () => {
        if (!inputValue || isNaN(inputValue)) {
            setResult('');
            return;
        }

        let convertedValue;

        if (category === 'temperature') {
            let celsius;
            if (inputUnit === 'celsius') celsius = parseFloat(inputValue);
            else if (inputUnit === 'fahrenheit') celsius = (parseFloat(inputValue) - 32) * 5 / 9;
            else if (inputUnit === 'kelvin') celsius = parseFloat(inputValue) - 273.15;

            if (outputUnit === 'celsius') convertedValue = celsius;
            else if (outputUnit === 'fahrenheit') convertedValue = (celsius * 9 / 5) + 32;
            else if (outputUnit === 'kelvin') convertedValue = celsius + 273.15;
        } else {
            const baseValue = parseFloat(inputValue) / converters[category].units[inputUnit];
            convertedValue = baseValue * converters[category].units[outputUnit];
        }

        setResult(convertedValue.toFixed(6));
    };

    const currentUnits = Object.keys(converters[category].units);
    if (!currentUnits.includes(inputUnit)) setInputUnit(currentUnits[0]);
    if (!currentUnits.includes(outputUnit)) setOutputUnit(currentUnits[1] || currentUnits[0]);

    return (
        <div style={{ padding: '20px', color: '#fff', height: '100%', overflow: 'auto' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>Unit Converter</h3>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#aaa' }}>Category:</label>
                <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setInputUnit(Object.keys(converters[e.target.value].units)[0]);
                        setOutputUnit(Object.keys(converters[e.target.value].units)[1] || Object.keys(converters[e.target.value].units)[0]);
                    }}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '14px'
                    }}
                >
                    {Object.entries(converters).map(([key, val]) => (
                        <option key={key} value={key}>{val.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: '#aaa' }}>From:</label>
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            if (e.target.value) setTimeout(() => handleConvert(), 0);
                        }}
                        placeholder="Value"
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '12px' }}
                    />
                    <select
                        value={inputUnit}
                        onChange={(e) => {
                            setInputUnit(e.target.value);
                            if (inputValue) setTimeout(() => handleConvert(), 0);
                        }}
                        style={{ width: '100%', marginTop: '6px', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '12px' }}
                    >
                        {currentUnits.map(u => <option key={u} value={u}>{u.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: '#aaa' }}>To:</label>
                    <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(77,150,255,0.15)', border: '1px solid rgba(77,150,255,0.3)', marginBottom: '6px', minHeight: '38px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{result || '0'}</div>
                    </div>
                    <select
                        value={outputUnit}
                        onChange={(e) => {
                            setOutputUnit(e.target.value);
                            if (inputValue) setTimeout(() => handleConvert(), 0);
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '12px' }}
                    >
                        {currentUnits.map(u => <option key={u} value={u}>{u.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default function CalculatorApp() {
    const [activeTab, setActiveTab] = useState('standard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const tabs = [
        { id: 'standard', label: 'Standard', icon: CalcIcon },
        { id: 'scientific', label: 'Scientific', icon: TrendingUp },
        { id: 'dictionary', label: 'Dictionary', icon: BookOpen },
        { id: 'converter', label: 'Converter', icon: Zap }
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSidebarOpen(false);
    };

    return (
        <div style={{ display: 'flex', height: '100%', backgroundColor: 'transparent', position: 'relative' }}>
            {/* Toggle Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    zIndex: 1000,
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: '#1a1a1a',
                    color: '#aaa',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s'
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* Sidebar */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '160px',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease-out',
                    zIndex: 999,
                    paddingTop: '60px',
                    paddingLeft: '0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            style={{
                                padding: '12px 16px',
                                backgroundColor: isActive ? 'rgba(77,150,255,0.3)' : 'transparent',
                                borderLeft: isActive ? '3px solid #4d96ff' : '3px solid transparent',
                                color: isActive ? '#4d96ff' : '#aaa',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                textAlign: 'left',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Overlay when sidebar is open */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '160px',
                        right: 0,
                        bottom: 0,
                        zIndex: 998
                    }}
                />
            )}

            {/* Content Area */}
            <div style={{ flex: 1, overflow: 'auto', width: '100%', paddingTop: '10px' }}>
                {activeTab === 'standard' && <StandardCalculator />}
                {activeTab === 'scientific' && <ScientificCalculator />}
                {activeTab === 'dictionary' && <DictionaryPage />}
                {activeTab === 'converter' && <UnitConverter />}
            </div>
        </div>
    );
}
