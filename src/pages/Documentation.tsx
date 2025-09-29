import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <Link to="/" className="inline-flex items-center text-yellow-400 hover:text-yellow-500 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do strony głównej
        </Link>

        <div className="prose prose-invert prose-lg max-w-none bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h1 className="text-yellow-400">Dokumentacja Techniczna Systemu Losującego</h1>
          
          <h2>Wprowadzenie</h2>
          <p>
            Niniejszy dokument opisuje architekturę i zasady działania systemu losującego wykorzystywanego w aplikacji "Kto do odpowiedzi?". Celem systemu jest zapewnienie transparentnego, sprawiedliwego i kryptograficznie bezpiecznego mechanizmu generowania losowego numeru z zadanego przedziału. Kluczowym elementem systemu jest wykorzystanie entropii generowanej przez użytkownika w celu inicjalizacji generatora liczb pseudolosowych (PRNG), co znacząco podnosi jakość i nieprzewidywalność losowania w porównaniu do standardowych, w pełni deterministycznych funkcji.
          </p>

          <h2>Problem z Pseudolosowością w Środowiskach Komputerowych</h2>
          <p>
            Standardowe generatory liczb losowych, takie jak <code>Math.random()</code> w języku JavaScript, są w rzeczywistości generatorami liczb <em>pseudolosowych</em>. Oznacza to, że generowane przez nie sekwencje liczb, choć na pierwszy rzut oka wydają się losowe, są w pełni deterministyczne. Bazują one na skomplikowanych algorytmach matematycznych, które na podstawie początkowej wartości, zwanej "ziarnem" (ang. seed), produkują długą sekwencję liczb. Jeśli znamy algorytm i ziarno, jesteśmy w stanie odtworzyć całą sekwencję. W większości implementacji przeglądarkowych ziarno jest inicjalizowane na podstawie zegara systemowego, co w teorii pozwala na przewidzenie wyniku, jeśli znamy dokładny czas inicjalizacji. Taki poziom losowości jest niewystarczający dla zastosowań wymagających wysokiej nieprzewidywalności.
          </p>

          <h2>Generowanie Entropii jako Fundament Prawdziwej Losowości</h2>
          <p>
            Aby obejść ograniczenia PRNG, nasz system wprowadza pojęcie <strong>entropii</strong>. W kontekście informatyki i kryptografii, entropia jest miarą nieporządku, niepewności lub losowości w systemie. Im wyższa entropia, tym trudniej przewidzieć stan systemu. Doskonałym źródłem entropii są zjawiska fizyczne oraz interakcje człowieka z komputerem, ponieważ są one z natury nieprzewidywalne i niemożliwe do precyzyjnego odtworzenia.
          </p>
          <p>
            Nasza aplikacja wykorzystuje ruchy kursora myszy jako główne źródło entropii. W momencie, gdy użytkownik porusza myszą nad wyznaczonym obszarem, system w czasie rzeczywistym przechwytuje i zapisuje setki punktów danych. Każdy punkt składa się z:
          </p>
          <ul>
            <li>Współrzędnej X kursora</li>
            <li>Współrzędnej Y kursora</li>
          </ul>
          <p>
            Nawet najmniejsze drgnięcie ręki, zmiana prędkości czy trajektorii ruchu generuje unikalny strumień danych, który jest praktycznie niemożliwy do podrobienia czy odtworzenia. Ten strumień surowych danych stanowi fundament dla naszego procesu losowania.
          </p>

          <h2>Szczegółowy Opis Procesu Losowania</h2>
          <p>Proces losowania przebiega w kilku kluczowych etapach:</p>
          <ol>
            <li>
              <strong>Zbieranie Danych Entropijnych:</strong> Użytkownik jest proszony o poruszanie kursorem w dedykowanym polu. Aplikacja zbiera co najmniej 100 unikalnych punktów koordynatów (X, Y), aby zapewnić wystarczającą ilość danych wejściowych.
            </li>
            <li>
              <strong>Tworzenie Ziarna (Seed):</strong> Zebrane dane są przetwarzane w celu stworzenia pojedynczej, unikalnej i bardzo dużej liczby, która posłuży jako ziarno dla generatora. Proces ten polega na zsumowaniu wszystkich zebranych współrzędnych (zarówno X, jak i Y), a następnie pomnożeniu wyniku przez precyzyjny znacznik czasu (timestamp) z dokładnością do milisekund, pobrany w momencie inicjacji losowania.
              <br/>
              <code>ziarno = (suma(x) + suma(y)) * Date.now()</code>
              <br/>
              Dzięki temu nawet identyczne ruchy myszy wykonane w różnych momentach czasu wygenerują zupełnie inne ziarno.
            </li>
            <li>
              <strong>Inicjalizacja Generatora PRNG:</strong> Utworzone ziarno jest następnie używane do zainicjowania naszego własnego, deterministycznego generatora liczb pseudolosowych (funkcja <code>seededRandom</code> w kodzie źródłowym). Chociaż sam generator jest deterministyczny, jego wynik jest teraz bezpośrednio uzależniony od nieprzewidywalnego ziarna pochodzącego z entropii.
            </li>
            <li>
              <strong>Generowanie Wyniku Końcowego:</strong> Z tak zainicjowanego generatora pobierana jest liczba z przedziału od 0 do 1. Liczba ta jest następnie mapowana na dostępny zakres numerów w dzienniku (z uwzględnieniem wartości minimalnej, maksymalnej oraz numeru wykluczonego), aby wylosować ostateczny numer ucznia.
            </li>
          </ol>

          <h2>Transparentność i Otwarty Kod Źródłowy (Open Source)</h2>
          <p>
            Rozumiemy, jak ważna jest transparentność w procesach losowych. Dlatego cały kod źródłowy tej aplikacji jest publicznie dostępny i otwarty do wglądu dla każdego. Zachęcamy do samodzielnego audytu kodu, aby zweryfikować implementację opisanego powyżej mechanizmu.
          </p>
          <p>
            Repozytorium projektu znajduje się na platformie GitHub pod adresem:
            <br />
            <a href="https://github.com/cutiewolves/generator-numerkuf" target="_blank" rel="noopener noreferrer">https://github.com/cutiewolves/generator-numerkuf</a>
          </p>

          <h2>Podsumowanie</h2>
          <p>
            System losujący w aplikacji "Kto do odpowiedzi?" stosuje hybrydowe podejście, łącząc siłę deterministycznych algorytmów z nieprzewidywalnością ludzkiej interakcji. Poprzez wykorzystanie ruchów myszy do generowania unikalnego ziarna dla każdej sesji losowania, zapewniamy poziom losowości i sprawiedliwości, który jest znacznie wyższy niż w przypadku standardowych funkcji losujących. Proces jest w pełni transparentny, a jego implementacja jest otwarta do weryfikacji przez społeczność.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Documentation;