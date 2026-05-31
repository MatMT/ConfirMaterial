import { useState, useEffect } from "react";
import getRandomMessage from "../../utils/getRandomMessage.js";
import useProgressStore from "../../stores/progressStore.js";

const getCorrectOptionIndex = (options) => {
    return options.findIndex(option => option.correct);
};

export default function Question({ lessonId, questionData }) {
    const { completeQuestion, isQuestionUnlocked, initializeStore, isQuestionCompleted } = useProgressStore();
    const [feedback, setFeedback] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [preselectedOption, setPreselectedOption] = useState(null);

    useEffect(() => {
        initializeStore();
        setIsLoaded(true);
        if (isQuestionCompleted(lessonId, questionData.id)) {
            const correctIndex = getCorrectOptionIndex(questionData.options);
            setSelectedOption(correctIndex);
            setIsCorrect(true);
            setFeedback('Ya respondiste esta pregunta correctamente. 🎉');
        }
    }, [lessonId, questionData.id, questionData.options]);

    const isUnlocked = isQuestionUnlocked(lessonId, questionData.id);

    const handlePreselectAnswer = (optionIndex) => {
        // Permite cambiar la opción preseleccionada si no se ha confirmado una respuesta correcta.
        if (isCorrect !== true) {
            setPreselectedOption(optionIndex);
        }
    };

    const handleConfirmAnswer = () => {
        if (preselectedOption !== null) {
            const correct = questionData.options[preselectedOption].correct;
            setIsCorrect(correct);
            setSelectedOption(preselectedOption);
            if (correct) {
                setFeedback(getRandomMessage('correct'));
                completeQuestion(lessonId, questionData.id);
            } else {
                setFeedback(getRandomMessage('incorrect'));
                // Resetear la selección para permitir otra intento.
                setSelectedOption(null);
                setPreselectedOption(null);
            }
        }
    };

    if (!isLoaded) {
        return (
            <div className="my-4 p-6 border rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div 
            id={`question-${questionData.id}`}
            className={`my-4 p-6 border rounded-lg shadow-lg transition-all duration-500 ease-in-out 
            ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
            ${isCorrect === true ? 'bg-green-50 border-green-400' : ''} 
            ${isCorrect === false ? 'bg-red-50 border-red-400' : ''}`}>
            <h3 className=" md:text-3xl text-base/8 font-bold mb-4 text-gray-800">{questionData.text}</h3>

            <div className="space-y-3">
                {questionData.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrectOption = isSelected && isCorrect;
                    const isWrongOption = isSelected && !isCorrect;
                    const isPreselected = preselectedOption === index;

                    return (
                        <button
                            key={index}
                            onClick={() => handlePreselectAnswer(index)}
                            className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-300
                                ${!isUnlocked || isCorrect === true ? 'cursor-not-allowed' : 'cursor-pointer'}
                                ${isSelected ? 'border-2' : ''} 
                                ${isCorrectOption ? 'bg-green-100 border-green-500 animate-pulse' : ''}
                                ${isWrongOption ? 'bg-red-100 border-red-500 animate-shake' : ''}
                                ${isPreselected && !isSelected ? 'border-blue-600' : ''}
                                ${!isSelected && (isUnlocked && isCorrect !== true) ?
                                'hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transform hover:-translate-y-1' : ''}
                            `}
                            disabled={!isUnlocked || isCorrect === true}
                        >
                            <div className="flex items-center space-x-3">
                                <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border
                                    ${isCorrectOption ? 'bg-green-500 border-green-600 text-white' : ''}
                                    ${isWrongOption ? 'bg-red-500 border-red-600 text-white' : ''}
                                    ${!isSelected ? 'border-gray-300' : 'border-blue-300'}`}>
                                    {isCorrectOption && '✓'}
                                    {isWrongOption && '×'}
                                </span>
                                <span className={`text-lg ${isSelected ? 'font-medium' : ''}`}>
                                    {option.text}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {feedback && (
                <div className={`mt-4 p-3 rounded-lg text-center font-medium animate-fadeIn
                    ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {feedback}
                </div>
            )}

            <button
                onClick={handleConfirmAnswer}
                className={`mt-4 w-full py-2 text-white bg-blue-500 rounded-lg transition-all duration-300 hover:bg-blue-600 
                    ${!isUnlocked || preselectedOption === null || isCorrect === true ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                disabled={!isUnlocked || preselectedOption === null || isCorrect === true}
            >
                Confirmar
            </button>

        </div>
    );
}