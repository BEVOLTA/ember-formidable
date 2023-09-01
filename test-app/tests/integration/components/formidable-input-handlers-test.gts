import { blur, fillIn, focus, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';

import type { RegisterOptions } from 'ember-formidable';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('onChange -- It should trigger the input onChange instead of the default behavior', async function (assert) {
    const data = {
      foo: 'DEFAULT',
    };

    const onChange: RegisterOptions['onChange'] = (_event, api) => {
      api.setValue('foo', '🔆');
    };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <form>
          <input type='text' id='foo' {{api.register 'foo' onChange=onChange}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    await fillIn('#foo', '⚡️');
    assert.dom('#foo').hasValue('🔆');
  });

  test('onFocus -- It should trigger the input onFocus instead of the default behavior', async function (assert) {
    const data = {
      foo: 'DEFAULT',
    };

    const onFocus: RegisterOptions['onFocus'] = (_event, api) => {
      api.setValue('foo', '❄️');
    };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <form>
          <input type='text' id='foo' {{api.register 'foo' onFocus=onFocus}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    await focus('#foo');
    assert.dom('#foo').hasValue('❄️');
  });

  test('onBlur -- It should trigger the input onFocus instead of the default behavior', async function (assert) {
    const data = {
      foo: 'DEFAULT',
    };

    const onBlur: RegisterOptions['onBlur'] = (_event, api) => {
      api.setValue('foo', 'CHANGED');
    };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <form>
          <input type='text' id='foo' {{api.register 'foo' onBlur=onBlur}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    await focus('#foo');
    await blur('#foo');
    assert.dom('#foo').hasValue('CHANGED');
  });
});
