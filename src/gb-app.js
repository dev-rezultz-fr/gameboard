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
import { setPassiveTouchGestures, setRootPath } from '@polymer/polymer/lib/utils/settings.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import './gb-icons.js';

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

// Set Polymer's root path to the same value we passed to our service worker
// in `index.html`.
setRootPath(GbAppGlobals.rootPath);

class GbApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          --app-primary-color: #4285f4;
          --app-secondary-color: black;

          display: block;
        }

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }

        app-header {
          color: #fff;
          background-color: var(--app-primary-color);
        }

        app-header paper-icon-button {
          --paper-icon-button-ink-color: white;
        }

        .drawer-list {
          margin: 0 20px;
        }

        .drawer-list a {
          display: block;
          padding: 0 16px;
          text-decoration: none;
          color: var(--app-secondary-color);
          line-height: 40px;
          border-left: solid 3px white;
        }

        .drawer-list a.iron-selected {
          color: var(--app-primary-color);
          font-weight: bold;
          border-left: solid 3px var(--app-primary-color);
        }

        iron-icon.drawer{margin-right:12px;}
      </style>

      <app-location route="{{route}}" url-space-regex="^[[rootPath]]"></app-location>

      <app-route route="{{route}}" pattern="[[rootPath]]:page" data="{{routeData}}" tail="{{subroute}}"></app-route>

      <app-drawer-layout fullbleed="" narrow="{{narrow}}">
        <!-- Drawer content -->
        <app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]">
          <app-toolbar></app-toolbar>
          <iron-selector selected="[[page]]" attr-for-selected="name" class="drawer-list" role="navigation">
            <a name="games" href="[[rootPath]]games">
              <iron-icon class="drawer" icon="gb-icons:schedule"></iron-icon>
              Parties
            </a>
            <a name="new" href="[[rootPath]]new">
              <iron-icon class="drawer" icon="gb-icons:add-box"></iron-icon>
              Nouvelle partie
            </a>
            <a name="setup" href="[[rootPath]]setup">
              <iron-icon class="drawer" icon="gb-icons:settings"></iron-icon>
              Paramètres
            </a>
          </iron-selector>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout has-scrolling-region="">

          <app-header slot="header" condenses="" reveals="" effects="waterfall">
            <app-toolbar>
              <paper-icon-button icon="gb-icons:menu" drawer-toggle=""></paper-icon-button>
              <div main-title="">[[title]]</div>
            </app-toolbar>
          </app-header>

          <iron-pages selected="[[page]]" attr-for-selected="id" role="main">
            <gb-games id="games"></gb-games>
            <gb-new id="new"></gb-new>
            <gb-setup id="setup"></gb-setup>
            <gb-view404 id="view404"></gb-view404>
          </iron-pages>
        </app-header-layout>
      </app-drawer-layout>
    `;
  }

  static get properties() {
    return {
      page: {
        type: String,
        reflectToAttribute: true,
        observer: '_pageChanged'
      },
      title: String,
      routeData: Object,
      subroute: Object
    };
  }

  static get observers() {
    return [
      '_routePageChanged(routeData.page)'
    ];
  }

  _routePageChanged(page) {
     // Show the corresponding page according to the route.
     //
     // If no page was found in the route data, page will be an empty string.
     // Show 'games' in that case. And if the page doesn't exist, show 'view404'.
    if (!page) {
      this.page = 'games';
    } else if (['games', 'new', 'setup'].indexOf(page) !== -1) {
      this.page = page;
      this.title = GbAppGlobals.title + GbAppGlobals.titles[['games', 'new', 'setup'].indexOf(page)];
    } else {
      this.page = 'view404';
      this.title = GbAppGlobals.title + 'Page non trouvée';
    }

    // Close a non-persistent drawer when the page & route are changed.
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  _pageChanged(page) {
    // Import the page component on demand.
    //
    // Note: `polymer build` doesn't like string concatenation in the import
    // statement, so break it up.
    switch (page) {
      case 'games':
        import('./gb-games.js').then(this._refresh.bind(this));
        break;
      case 'new':
        import('./gb-new.js').then(this._refresh.bind(this));
        break;
      case 'setup':
        import('./gb-setup.js').then(this._refresh.bind(this));
        break;
      case 'view404':
        import('./gb-view404.js').then(this._refresh.bind(this));
        break;
    }
  }

  _refresh(){
    if(this.page && this.shadowRoot.querySelector('#'+this.page) && this.shadowRoot.querySelector('#'+this.page).refresh){
      this.shadowRoot.querySelector('#'+this.page).refresh();
    }
  }
}

window.customElements.define('gb-app', GbApp);
