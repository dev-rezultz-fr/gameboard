/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';

class GbSetup extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;

          padding: 10px;
        }
      </style>

      <div class="card">
        <h1>Numéro de device</h1>
        <input value="[[key]]" type="text" id="key"/>
        <button on-click="_saveKey">Valider</button>
      </div>
    `;
  }

  static get properties() {
    return {
      key: String
    };
  }

  _saveKey(e){
    if(this.$.key.value != ''){      
      GbAppGlobals.deviceKey = this.$.key.value;
      window.localStorage.setItem('deviceKey',GbAppGlobals.deviceKey);
      this.refresh();
    }
  }

  refresh(){
    console.log('refresh setup');
    console.log(this.key, GbAppGlobals, window.localStorage.getItem('deviceKey'));
    this.set('key',GbAppGlobals.deviceKey);
  }
}

window.customElements.define('gb-setup', GbSetup);
