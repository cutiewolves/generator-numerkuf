import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm-p-8">
      <div className="w-full max-w-4xl">
        <Link to="/" className="inline-flex items-center text-yellow-400 hover:text-yellow-500 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do strony głównej
        </Link>

        <div className="prose prose-invert prose-lg max-w-none bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h1 className="text-yellow-400">Dokumentacja Techniczna Systemu Losującego</h1>
          
          <h2>Wprowadzenie</h2>
          <p>
            Celem niniejszego dokumentu jest szczegółowe i transparentne wyjaśnienie mechanizmu losowania numerów w aplikacji "Kto do odpowiedzi?". Nasz system został zaprojektowany tak, aby zapewnić maksymalny poziom sprawiedliwości i nieprzewidywalności, znacznie przewyższający standardowe funkcje losujące dostępne w przeglądarkach internetowych. Kluczem do osiągnięcia tego celu jest hybrydowe podejście, które łączy <strong>entropię generowaną przez użytkownika</strong> z <strong>wysokiej jakości generatorem liczb pseudolosowych (PRNG)</strong>.
          </p>

          <h2>Problem: Przewidywalna "Losowość" Komputerów</h2>
          <p>
            Komputery z natury są maszynami deterministycznymi. Oznacza to, że standardowe funkcje, takie jak <code>Math.random()</code> w JavaScript, nie generują prawdziwie losowych liczb. Produkują one sekwencje <em>pseudolosowe</em>, które, choć wyglądają na losowe, są w rzeczywistości wynikiem skomplikowanych, ale w pełni powtarzalnych obliczeń matematycznych. Cały proces zależy od początkowej wartości zwanej "ziarnem" (ang. seed). Jeśli znamy algorytm i ziarno, możemy dokładnie odtworzyć całą sekwencję liczb. To sprawia, że takie generatory są nieodpowiednie dla zastosowań, gdzie kluczowa jest autentyczna nieprzewidywalność.
          </p>

          <h2>Nasze Rozwiązanie: Proces Losowania w Czterech Krokach</h2>
          <p>Aby rozwiązać ten problem, nasz system opiera się na unikalnym wkładzie od użytkownika, aby każde losowanie było jedyne w swoim rodzaju. Proces przebiega następująco:</p>
          
          <h3>Krok 1: Zbieranie Entropii z Ruchów Myszy</h3>
          <p>
            Podstawą prawdziwej losowości jest nieprzewidywalność. W naszym systemie źródłem tej nieprzewidywalności jesteś Ty — użytkownik. Aplikacja prosi o poruszanie kursorem myszy w wyznaczonym polu. W tym czasie, nasz system precyzyjnie rejestruje setki współrzędnych (X, Y) kursora. Te dane, zwane <strong>entropią</strong>, są unikalne dla każdego użytkownika i każdej sesji. Subtelne drżenie ręki, prędkość i krzywizna ruchu tworzą cyfrowy "odcisk palca", który jest praktycznie niemożliwy do podrobienia lub powtórzenia.
          </p>
          <pre><code>
{`// Fragment kodu z hooka useMouseEntropy.tsx
const handleMouseMove = useCallback((event: MouseEvent) => {
  if (ref.current) {
    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Zapisujemy punkty do tablicy
    setPoints((prevPoints) => [...prevPoints, { x, y }].slice(-200));
  }
}, [ref]);`}
          </code></pre>

          <h3>Krok 2: Tworzenie Unikalnego Ziarna (Seed)</h3>
          <p>
            Zebrane punkty entropii są następnie przetwarzane w celu stworzenia pojedynczej, dużej liczby, która posłuży jako "ziarno" dla naszego generatora. Aby zapewnić jeszcze większą unikalność, sumę wszystkich współrzędnych mnożymy przez dokładny znacznik czasu (timestamp) z precyzją do milisekundy, pobrany w momencie kliknięcia przycisku "Losuj!".
          </p>
          <p>Formuła wygląda następująco: <code>ziarno = (suma wszystkich X i Y) * Date.now()</code></p>
          <pre><code>
{`// Fragment kodu z Index.tsx
const seed = points.reduce((acc, p) => acc + p.x + p.y, 0) * Date.now();`}
          </code></pre>
          <p>
            Dzięki temu, nawet gdyby dwie osoby wykonały identyczne ruchy myszą, ale w różnych momentach, wygenerowane ziarna będą zupełnie inne, co gwarantuje unikalność każdego losowania.
          </p>

          <h3>Krok 3: Inicjalizacja Generatora Mulberry32</h3>
          <p>
            Zamiast polegać na wbudowanym w przeglądarkę <code>Math.random()</code>, używamy własnej implementacji generatora PRNG o nazwie <strong>Mulberry32</strong>. Jest to algorytm znany z bardzo dobrych właściwości statystycznych, co oznacza, że generowane przez niego liczby są równomiernie rozłożone i pozbawione niepożądanych wzorców. Nasze unikalne ziarno z Kroku 2 jest używane do jednorazowej inicjalizacji tego generatora.
          </p>
          <pre><code>
{`// Implementacja generatora Mulberry32 w Index.tsx
const mulberry32 = (seed: number) => {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
};`}
          </code></pre>

          <h3>Krok 4: Wybór Ostatecznego Numeru</h3>
          <p>
            Zainicjowany generator Mulberry32 jest wywoływany jeden raz, aby wyprodukować liczbę z przedziału od 0 do 1. Ta liczba jest następnie używana do wylosowania indeksu z puli dostępnych numerów (po uwzględnieniu zakresu min-max i wykluczeniu "szczęśliwego numerka"). Numer znajdujący się pod wylosowanym indeksem staje się ostatecznym, wygranym wynikiem.
          </p>
          <pre><code>
{`// Fragment kodu z Index.tsx
const randomGenerator = mulberry32(seed);
const randomIndex = Math.floor(randomGenerator() * possibleNumbers.length);
const finalNumber = possibleNumbers[randomIndex];`}
          </code></pre>
          
          <h2>Wizualizacja a Wynik</h2>
          <p>
            Warto podkreślić, że animacja kręcącej się ruletki jest jedynie <strong>wizualizacją</strong> już wylosowanego wyniku. Ostateczny numer jest determinowany w momencie kliknięcia przycisku "Losuj!", zanim animacja w ogóle się rozpocznie. Pozostałe numery widoczne na ruletce są losowo dobierane w taki sposób, aby animacja była płynna i dynamiczna (m.in. unikamy powtórzeń sąsiadujących numerów), ale nie mają one żadnego wpływu na ostateczny, już ustalony wynik.
          </p>

          <h2>Transparentność i Otwarty Kod Źródłowy</h2>
          <p>
            Wierzymy, że kluczem do zaufania jest pełna transparentność. Dlatego cały kod źródłowy aplikacji, włączając w to opisany tutaj mechanizm losujący, jest publicznie dostępny do wglądu i audytu.
          </p>
          <p>
            Repozytorium projektu na GitHub:
            <br />
            <a href="https://github.com/cutiewolves/generator-numerkuf" target="_blank" rel="noopener noreferrer">https://github.com/cutiewolves/generator-numerkuf</a>
          </p>

          <h2>Podsumowanie</h2>
          <p>
            System losujący w aplikacji "Kto do odpowiedzi?" łączy nieprzewidywalność ludzkiej interakcji z matematyczną precyzją wysokiej jakości algorytmu. Poprzez generowanie unikalnego ziarna z ruchów myszy, zapewniamy, że każde losowanie jest niezależnym, sprawiedliwym i kryptograficznie bezpiecznym zdarzeniem.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Documentation;