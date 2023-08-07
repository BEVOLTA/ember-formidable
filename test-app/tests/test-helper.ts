import { start } from 'ember-qunit';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import Application from 'test-app/app';
import config from 'test-app/config/environment';

import { setApplication } from '@ember/test-helpers';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
