export const STRIPE_ELEMENT_STYLES = {
    base: {
      color: '#32325D',
      fontWeight: 500,
      fontFamily: 'Source Code Pro, Consolas, Menlo, monospace',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#CFD7DF',
      },
      ':-webkit-autofill': {
        color: '#e39f48',
      },
    },
    invalid: {
      color: '#E25950',
      '::placeholder': {
        color: '#FFCCA5',
      },
    },
  };

export const STRIPE_ELEMENT_CLASSES = {
    focus: 'focused',
    empty: 'empty',
    invalid: 'invalid',
};