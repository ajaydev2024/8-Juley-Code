/* eslint-disable */

/**
 * Dependencies:
 * - Custom select component
 *
 * Required translation strings:
 * - addToCart
 * - noStock
 * - noVariant
 * - onlyXLeft
 */

if (!customElements.get('variant-picker')) {
  class VariantPicker extends HTMLElement {
    constructor() {
      super();
      this.section = this.closest('.js-product');
      this.productForm = this.section.querySelector('.js-product-form-main');
      this.optionSelectors = this.querySelectorAll('.option-selector');
      this.data = this.getProductData();

      this.updateAvailability();
      this.addEventListener('change', this.handleVariantChange.bind(this));
    }

    /**
     * Handles 'change' events on the variant picker element.
     * @param {object} evt - Event object.
     */
    handleVariantChange(evt) {
      const selectedOptions = this.getSelectedOptions();
      this.variant = null;

      // Get selected variant data (if variant exists).
      this.variant = this.data.product.variants.find((v) =>
        v.options.every((val, index) => val === selectedOptions[index])
      );

      if (this.variant) {
        this.updateMedia();
        this.updateUrl(evt);
        this.updateVariantInput();
      }

      this.updateAddToCartButton();
      this.updateAvailability();
      this.updatePrice();
      this.updateWeight();
      this.updateBarcode();
      this.updateBackorderText();
      this.updatePickupAvailability();
      this.updateSku();
      this.updateMetafields();
      VariantPicker.updateLabelText(evt);

      this.dispatchEvent(new CustomEvent('on:variant:change', {
        bubbles: true,
        detail: {
          form: this.productForm,
          variant: this.variant,
          product: this.data.product
        }
      }));
    }

    /**
     * Updates the "Add to Cart" button label and disabled state.
     */
    updateAddToCartButton() {
      this.productForm = this.section.querySelector('.js-product-form-main');
      if (!this.productForm) return;

      this.addBtn = this.addBtn || this.productForm.querySelector('[name="add"]');
      const variantAvailable = this.variant && this.variant.available;
      const unavailableStr = this.variant ? theme.strings.noStock : theme.strings.noVariant;

      this.addBtn.disabled = !variantAvailable;
      this.addBtn.textContent = variantAvailable
        ? this.addBtn.dataset.addToCartText
        : unavailableStr;
    }

    /**
     * Updates the availability status in option selectors.
     */
    updateAvailability() {
      if (this.dataset.showAvailability === 'false') return;
      let currVariant = this.variant;

      if (!this.variant) {
        currVariant = { options: this.getSelectedOptions() };
      }

      const updateOptionAvailability = (optionEl, available, soldout) => {
        const el = optionEl;
        const text = soldout ? theme.strings.noStock : theme.strings.noVariant;
        el.classList.toggle('is-unavailable', !available);

        if (optionEl.classList.contains('custom-select__option')) {
          const em = el.querySelector('em');

          if (em) {
            em.hidden = available;
          }

          if (!available) {
            if (em) {
              em.textContent = text;
            } else {
              el.innerHTML = `${el.innerHTML} <em class="pointer-events-none">${text}</em>`;
            }
          }
        } else if (!available) {
          el.nextElementSibling.title = text;
        } else {
          el.nextElementSibling.removeAttribute('title');
        }
      };

      // Flag all options as unavailable
      this.querySelectorAll('.js-option').forEach((optionEl) => {
        updateOptionAvailability(optionEl, false, false);
      });

      // Flag selector options as available or sold out, depending on the variant availability
      this.optionSelectors.forEach((selector, selectorIndex) => {
        this.data.product.variants.forEach((variant) => {
          let matchCount = 0;

          variant.options.forEach((option, optionIndex) => {
            if (option === currVariant.options[optionIndex] && optionIndex !== selectorIndex) {
              matchCount += 1;
            }
          });

          if (matchCount === currVariant.options.length - 1) {
            const options = selector.querySelectorAll('.js-option');
            const optionEl = Array.from(options).find((opt) => {
              if (selector.dataset.selectorType === 'dropdown') {
                return opt.dataset.value === variant.options[selectorIndex];
              }
              return opt.value === variant.options[selectorIndex];
            });

            if (optionEl) {
              updateOptionAvailability(optionEl, variant.available, !variant.available);
            }
          }
        });
      });
    }

    /**
     * Updates the backorder text and visibility.
     */
    updateBackorderText() {
      this.backorder = this.backorder || this.section.querySelector('.backorder');
      if (!this.backorder) return;

      let hideBackorder = true;

      if (this.variant && this.variant.available) {
        const { inventory } = this.data.formatted[this.variant.id];

        if (this.variant.inventory_management && inventory === 'none') {
          const backorderProdEl = this.backorder.querySelector('.backorder__product');
          const prodTitleEl = this.section.querySelector('.product-title');
          const variantTitle = this.variant.title.includes('Default')
            ? ''
            : ` - ${this.variant.title}`;

          backorderProdEl.textContent = `${prodTitleEl.textContent}${variantTitle}`;
          hideBackorder = false;
        }
      }

      this.backorder.hidden = hideBackorder;
    }

    /**
     * Updates the color option label text.
     * @param {object} evt - Event object
     */
    static updateLabelText(evt) {
      const selector = evt.target.closest('.option-selector');
      if (selector.dataset.selectorType === 'dropdown') return;

      const colorText = selector.querySelector('.js-color-text');
      if (!colorText) return;

      colorText.textContent = evt.target.nextElementSibling.querySelector('.js-value').textContent;
    }

    /**
     * Updates the product media.
     */
    updateMedia() {
      if (!this.variant.featured_media) return;

      if (this.section.matches('quick-add-drawer')) {
        this.section.updateMedia(this.variant.featured_media.id);
      } else {
        this.mediaGallery = this.mediaGallery || this.section.querySelector('media-gallery');
        if (!this.mediaGallery) return;

        const variantMedia = this.mediaGallery.querySelector(
          `[data-media-id="${this.variant.featured_media.id}"]`
        );
        this.mediaGallery.setActiveMedia(variantMedia, true, true);
      }
    }

    /**
     * Updates the pick up availability.
     */
    updatePickupAvailability() {
      this.pickUpAvailability =
        this.pickUpAvailability || this.section.querySelector('pickup-availability');
      if (!this.pickUpAvailability) return;

      if (this.variant && this.variant.available) {
        this.pickUpAvailability.getAvailability(this.variant.id);
      } else {
        this.pickUpAvailability.removeAttribute('available');
        this.pickUpAvailability.innerHTML = '';
      }
    }

    /**
     * Updates the price.
     */
    updatePrice() {
      this.price = this.price || this.section.querySelector('.product-info__price > .price') || this.section.querySelector('.new-custom-price');
      if (!this.price) return;

      if (this.variant) {
        const priceCurrentEl = this.price.querySelector('.variant-selling_price') || this.price.querySelector('.price__current');
        const priceWasEl = this.price.querySelector('.variant_compare-price') || this.price.querySelector('.price__was');
        const unitPriceEl = this.price.querySelector('.unit-price');

        // Update current price and original price if on sale.
        if(priceCurrentEl) priceCurrentEl.innerHTML = this.data.formatted[this.variant.id].price;
        if (priceWasEl)
          if (this.data.formatted[this.variant.id].compareAtPrice > this.data.formatted[this.variant.id].price) {
            priceWasEl.innerHTML = this.data.formatted[this.variant.id].compareAtPrice || '';
            priceWasEl.closest('strong')?.classList.remove('hidden');
          } else {
            priceWasEl.innerHTML = this.data.formatted[this.variant.id].compareAtPrice || '';
            priceWasEl.closest('strong')?.classList.add('hidden');
          }

        this.price.querySelectorAll('.prodct-meta-rrp').forEach((each) => {
          const dataVid = parseInt(each.getAttribute('data-vid'));

          if (dataVid == this.variant.id) {
            each.classList.remove('hidden');
          } else {
            each.classList.add('hidden');
          }
        });



        // Update unit price, if specified.
        if (this.variant.unit_price_measurement) {
          const valueEl = this.price.querySelector('.unit-price__price');
          const unitEl = this.price.querySelector('.unit-price__unit');
          const value = this.variant.unit_price_measurement.reference_value;
          const unit = this.variant.unit_price_measurement.reference_unit;

          valueEl.innerHTML = this.data.formatted[this.variant.id].unitPrice;
          unitEl.textContent = value === 1 ? unit : `${value} ${unit}`;
        }

        if (this.variant.unit_price_measurement) unitPriceEl.hidden = !this.variant.unit_price_measurement;
        this.price.classList.toggle(
          'price--on-sale',
          this.variant.compare_at_price > this.variant.price
        );
        this.price.classList.toggle('price--sold-out', !this.variant.available);
      }
      if (this.variant) {
        // this.price.querySelector('.price__default').hidden = !this.variant;
        // this.price.querySelector('.price__no-variant').hidden = this.variant;
      }
    }

    /**
     * Updates the weight.
     */
    updateWeight() {
      this.weights = this.weights || this.section.querySelectorAll('.product-info__weight');
      if (this.weights.length === 0) return;

      const weightAvailable = this.variant && this.variant.weight > 0;
      this.weights.forEach((weight) => {
        weight.textContent = weightAvailable ? this.data.formatted[this.variant.id].weight : '';
        weight.hidden = !weightAvailable;
      });
    }


    /**
     * Updates the metafield.
     */

      updateMetafields() {
        this.variantMetafields = document.querySelectorAll('[variant-metafield]');
        this.variantMetafields.forEach((metafield) => {
          const metafileId = metafield.getAttribute('data-variant-id')
          if(this.variant.id == metafileId){
            metafield.classList.remove('hidden');
        } else {
          metafield.classList.add('hidden');
        }
      });
    }

    /**
     * Updates the Barcode.
     */
    updateBarcode() {
      this.barcodes = this.barcodes || this.section.querySelectorAll('.product-info__barcode-value');
      if (this.barcodes.length === 0) return;

      const barcodeAvailable = this.variant && this.variant.barcode;
      this.barcodes.forEach((barcode) => {
        barcode.textContent = barcodeAvailable ? this.variant.barcode : '';
        barcode.parentNode.hidden = !barcodeAvailable;
      });
    }

    /**
     * Updates the SKU.
     */
    updateSku() {
      this.sku = this.sku || this.section.querySelector('.product-sku__value');
      if (!this.sku) return;

      const skuAvailable = this.variant && this.variant.sku;
      this.sku.textContent = skuAvailable ? this.variant.sku : '';
      this.sku.parentNode.hidden = !skuAvailable;
    }

    /**
     * Updates the url with the selected variant id.
     * @param {object} evt - Event object.
     */
    updateUrl(evt) {
      if (!evt || evt.type !== 'change' || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.variant.id}`);
    }

    /**
     * Updates the value of the hidden [name="id"] form inputs.
     */
    updateVariantInput() {
      this.forms =
        this.forms || this.section.querySelectorAll('.js-product-form-main, .js-instalments-form');

      this.forms.forEach((form) => {
        const input = form.querySelector('input[name="id"]');
        input.value = this.variant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    /**
     * Gets the selected option element from each selector.
     * @returns {Array}
     */
    getSelectedOptions() {
      const selectedOptions = [];

      this.optionSelectors.forEach((selector) => {
        if (selector.dataset.selectorType === 'dropdown') {
          selectedOptions.push(selector.querySelector('.custom-select__btn').textContent.trim());
        } else {
          selectedOptions.push(selector.querySelector('input:checked').value);
        }
      });

      return selectedOptions;
    }

    /**
     * Gets the product data.
     * @returns {?object}
     */
    getProductData() {
      const dataEl = this.querySelector('[type="application/json"]');
      return JSON.parse(dataEl.textContent);
    }
  }

  customElements.define('variant-picker', VariantPicker);
}
