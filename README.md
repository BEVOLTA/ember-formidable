# ember-formidable

Form manager for Ember.

## Compatibility

- Ember.js v4.12 or above
- `ember-modifier`` 4.1 or above
- Embroider or ember-auto-import v2

## Installation

```sh
ember install ember-formidable
```

## Usage

```hbs
<Formidable @values={{data}} @handler={{handler}} as |api|>
  <form {{on 'submit' api.onSubmit}}>
    <input type='text' id='foo' {{api.register 'foo'}} />
    <button id='submit' type='submit'>SUBMIT</button>
  </form>
</Formidable>
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
