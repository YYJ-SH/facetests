import { useState } from 'react';

export default function ResultsPage({ results }) {
  const [copied, setCopied] = useState(false);

  const allPersons = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
  const methods = ['blur', 'mask', 'pixel'];
  const intensities = [50, 75];

  const calculateAccuracy = (items) => 
    items.length > 0 ? (items.filter(r => r.correct).length / items.length * 100).toFixed(2) : "0.00";

  const overallAccuracy = calculateAccuracy(results);

  const methodAccuracy = methods.reduce((acc, method) => {
    acc[method] = calculateAccuracy(results.filter(r => r.method === method));
    return acc;
  }, {});

  const personAccuracy = allPersons.reduce((acc, person) => {
    acc[person] = calculateAccuracy(results.filter(r => r.originalPerson === person));
    return acc;
  }, {});

  const methodIntensityAccuracy = methods.reduce((acc, method) => {
    acc[method] = {};
    if (method !== 'mask') {
      intensities.forEach(intensity => {
        acc[method][intensity] = calculateAccuracy(results.filter(r => r.method === method && r.intensity === intensity));
      });
    }
    return acc;
  }, {});

  const resultText = `전체 정확도: ${overallAccuracy}%\n\n` +
    '비식별화 방법별 정확도:\n' +
    Object.entries(methodAccuracy).map(([method, accuracy]) =>
      `${method}: ${accuracy}%`
    ).join('\n') + '\n\n' +
    '비식별화 방법 및 강도별 정확도:\n' +
    Object.entries(methodIntensityAccuracy).flatMap(([method, intensities]) =>
      method !== 'mask' 
        ? Object.entries(intensities).map(([intensity, accuracy]) => 
            `${method} (${intensity}%): ${accuracy}%`
          )
        : [`${method}: ${methodAccuracy[method]}%`]
    ).join('\n') + '\n\n' +
    '인물별 정확도:\n' +
    Object.entries(personAccuracy).map(([person, accuracy]) =>
      `${person}: ${accuracy}%`
    ).join('\n') + '\n\n' +
    '개별 테스트 결과:\n' +
    results.map((r, i) => 
      `테스트 ${i + 1} (${r.method}${r.intensity ? ` ${r.intensity}%` : ''}): 선택 ${r.selectedPerson} (정답: ${r.originalPerson}) - ${r.correct ? '정답' : '오답'}`
    ).join('\n');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">테스트 결과</h1>
      <p className="text-xl text-center mb-4">전체 정확도: {overallAccuracy}%</p>
      
      <h2 className="text-xl font-semibold mt-6 mb-2">비식별화 방법별 정확도:</h2>
      {Object.entries(methodAccuracy).map(([method, accuracy]) => (
        <p key={method} className="mb-1">{method}: {accuracy}%</p>
      ))}

      <h2 className="text-xl font-semibold mt-6 mb-2">비식별화 방법 및 강도별 정확도:</h2>
      {Object.entries(methodIntensityAccuracy).map(([method, intensities]) => (
        method !== 'mask' ? (
          Object.entries(intensities).map(([intensity, accuracy]) => (
            <p key={`${method}-${intensity}`} className="mb-1">{method} ({intensity}%): {accuracy}%</p>
          ))
        ) : (
          <p key={method} className="mb-1">{method}: {methodAccuracy[method]}%</p>
        )
      ))}

      <h2 className="text-xl font-semibold mt-6 mb-2">인물별 정확도:</h2>
      {Object.entries(personAccuracy).map(([person, accuracy]) => (
        <p key={person} className="mb-1">{person}: {accuracy}%</p>
      ))}

      <h2 className="text-xl font-semibold mt-6 mb-2">개별 테스트 결과:</h2>
      <div className="bg-gray-100 p-4 rounded-lg mb-6 h-60 overflow-y-auto">
        {results.map((r, i) => (
          <p key={i} className={`mb-1 ${r.correct ? 'text-green-600' : 'text-red-600'}`}>
            테스트 {i + 1} ({r.method}{r.intensity ? ` ${r.intensity}%` : ''}): 
            선택 {r.selectedPerson} (정답: {r.originalPerson}) - {r.correct ? '정답' : '오답'}
          </p>
        ))}
      </div>

      <button 
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={copyToClipboard}
      >
        {copied ? '복사됨!' : '결과 복사'}
      </button>
    </div>
  );
}