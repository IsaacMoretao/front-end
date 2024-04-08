import { useEffect } from 'react';
import '../Stylles/Button.css';

export default function SubmitButton() {
  useEffect(() => {
    const button = document.getElementById('button');

    if (button) {
      const handleClick = () => {
        button.classList.add('onclic');
        setTimeout(() => {
          button.classList.remove('onclic');
          button.classList.add('afterClick');
          setTimeout(() => {
            button.classList.remove('afterClick');
          }, 2000);
        }, 2250);
      };

      button.addEventListener('click', handleClick);

      return () => {
        button.removeEventListener('click', handleClick);
      };
    }
  }, []);

  return (
    <div className="bloco">
      <button id="button" type="button"/>
    </div>
  );
}