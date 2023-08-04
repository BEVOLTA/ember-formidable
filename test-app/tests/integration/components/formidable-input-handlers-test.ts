import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { FormidableContext } from 'test-app/tests/types';

import { blur, fillIn, focus, render } from '@ember/test-helpers';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('onChange -- It should trigger the change', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };
    this.onChange = (_event, api) => {
      // @ts-ignore
      api.setValue('foo', 'NEW');
    };
    await render(hbs`
      <Formidable @values={{this.values}} as |values api|>
        <form>
          <input type="text" id="foo" {{api.register "foo"  onChange=this.onChange}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    await fillIn('#foo', 'CHANGED');
    assert.dom('#foo').hasValue('NEW');
  });

  test('onFocus -- It should trigger the focus', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };
    this.onFocus = (_event, api) => {
      // @ts-ignore
      api.setValue('foo', 'CHANGED');
    };
    await render(hbs`
      <Formidable @values={{this.values}} as |values api|>
        <form>
          <input type="text" id="foo" {{api.register "foo"  onFocus=this.onFocus}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    await focus('#foo');
    assert.dom('#foo').hasValue('CHANGED');
  });

  test('onBlur -- It should trigger the blur', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };
    this.onBlur = (_event, api) => {
      // @ts-ignore
      api.setValue('foo', 'CHANGED');
    };
    await render(hbs`
      <Formidable @values={{this.values}} as |values api|>
        <form>
          <input type="text" id="foo" {{api.register "foo"  onBlur=this.onBlur}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    await focus('#foo');
    await blur('#foo');
    assert.dom('#foo').hasValue('CHANGED');
  });
});
