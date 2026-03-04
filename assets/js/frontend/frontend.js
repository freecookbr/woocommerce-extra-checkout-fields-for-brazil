/* global bmwPublicParams */
jQuery(function ($) {
	/**
	 * Frontend actions
	 */
	const bmwFrontEnd = {
		/**
		 * Initialize frontend actions
		 */
		init() {
			if ('0' !== bmwPublicParams.person_type) {
				this.person_type_fields();
			}

			if ('yes' === bmwPublicParams.maskedinput) {
				$(document.body).on('change', '#billing_country', function () {
					if ('BR' === $(this).val()) {
						bmwFrontEnd.maskBilling();
					} else {
						bmwFrontEnd.unmaskBilling();
					}
				});

				$(document.body).on('change', '#shipping_country', function () {
					if ('BR' === $(this).val()) {
						bmwFrontEnd.maskShipping();
					} else {
						bmwFrontEnd.unmaskShipping();
					}
				});

				if ('BR' === $('#billing_country').val()) {
					bmwFrontEnd.maskBilling();
				}

				if ('BR' === $('#shipping_country').val()) {
					bmwFrontEnd.maskShipping();
				}

				this.maskGeneral();
			}

			if ('yes' === bmwPublicParams.mailcheck) {
				this.emailCheck();
			}

			if (bmwPublicParams.ajax_url) {
				this.cnpjLookup();
			}

			// Check if select2 exists.
			if ($().select2) {
				$('.wc-ecfb-select').select2();
			}
		},

		person_type_fields() {
			/**
			 * Control person type fields
			 *
			 * @param {string}  personType
			 * @param {boolean} checkCountry
			 */
			const handleFields = function (personType, checkCountry = false) {
				let country = 'BR';

				if (checkCountry) {
					country = $('#billing_country').val();
				}

				$('.person-type-field')
					.hide()
					.removeClass(
						'validate-required is-active woocommerce-validated'
					);
				$('#billing_persontype_field').show().addClass('is-active');

				if ('1' === personType) {
					if ('BR' === country) {
						$('#billing_cpf_field')
							.addClass(
								'validate-required is-active woocommerce-validated'
							)
							.show();
						$('#billing_rg_field')
							.addClass(
								'validate-required is-active woocommerce-validated'
							)
							.show();
					} else {
						$('#billing_cpf_field').show().addClass('is-active');
						$('#billing_rg_field').show().addClass('is-active');
					}
				}

				if ('2' === personType) {
					if ('BR' === country) {
						$('#billing_company_field label .optional').remove();
						$('#billing_company_field')
							.addClass(
								'validate-required is-active woocommerce-validated'
							)
							.show();
						$('#billing_cnpj_field')
							.addClass(
								'validate-required is-active woocommerce-validated'
							)
							.show();
						$('#billing_ie_field')
							.addClass(
								'validate-required is-active woocommerce-validated'
							)
							.show();
					} else {
						$('#billing_company_field')
							.addClass('is-active')
							.show();
						$('#billing_cnpj_field').addClass('is-active').show();
						$('#billing_ie_field').addClass('is-active').show();
					}
				}

				if ('BR' === country) {
					$('.person-type-field label .required').remove();
					$('.person-type-field label').append(
						' <abbr class="required" title="' +
							bmwPublicParams.required +
							'">*</abbr>'
					);
				}
			};

			/**
			 * Maybe run handle fields
			 *
			 * @param {boolean} checkCountry
			 * @return {void}
			 */
			const maybeRunHandleFields = function (checkCountry = false) {
				if ('1' === bmwPublicParams.person_type) {
					$('#billing_persontype')
						.on('change', function () {
							const personType = $(this).val();

							handleFields(personType, checkCountry);
						})
						.change();
				}
			};

			// Required fields.
			if ('no' === bmwPublicParams.only_brazil) {
				$('.person-type-field label .required').remove();
				$('.person-type-field label').append(
					' <abbr class="required" title="' +
						bmwPublicParams.required +
						'">*</abbr>'
				);

				maybeRunHandleFields();
			} else {
				$('.person-type-field').removeClass(
					'validate-required is-active woocommerce-validated'
				);
				$('.person-type-field label .required').remove();
				maybeRunHandleFields(true);

				$('#billing_country')
					.on('change', function () {
						const current = $(this).val();

						if ('BR' === current) {
							if ('0' !== bmwPublicParams.person_type) {
								let personType;
								if (bmwPublicParams.person_type === '1') {
									personType = $('#billing_persontype').val();
								} else {
									// bwmPublicParams.person_type 2 means individuals, 3 means legal person
									// offsetting it by one returns what we would expect from #billing_persontype
									personType = (
										bmwPublicParams.person_type - 1
									).toString();
								}
								handleFields(personType);
							}
						} else {
							$('.person-type-field').removeClass(
								'validate-required is-active woocommerce-validated'
							);
							$('.person-type-field label .required').remove();
						}
					})
					.change();
			}
		},

		maskBilling() {
			bmwFrontEnd.maskPhone('#billing_phone, #billing_cellphone');
			$('#billing_birthdate').mask('00/00/0000');
			$('#billing_postcode').mask('00000-000');
			$(
				'#billing_phone, #billing_cellphone, #billing_birthdate, #billing_postcode'
			).attr('type', 'tel');
		},

		unmaskBilling() {
			$(
				'#billing_phone, #billing_cellphone, #billing_birthdate, #billing_postcode'
			)
				.unmask()
				.attr('type', 'text');
		},

		maskShipping() {
			$('#shipping_postcode').mask('00000-000').attr('type', 'tel');
		},

		unmaskShipping() {
			$('#shipping_postcode').unmask().attr('type', 'text');
		},

		maskGeneral() {
			$('#billing_cpf, #credit-card-cpf').mask('000.000.000-00');
			$('#billing_cnpj').mask('00.000.000/0000-00');
			bmwFrontEnd.maskPhone('#credit-card-phone');
		},

		maskPhone(selector) {
			const $element = $(selector),
				MaskBehavior = function (val) {
					return val.replace(/\D/g, '').length === 11
						? '(00) 00000-0000'
						: '(00) 0000-00009';
				},
				maskOptions = {
					onKeyPress(val, e, field, options) {
						field.mask(MaskBehavior.apply({}, arguments), options);
					},
				};

			$element.mask(MaskBehavior, maskOptions);
		},

		emailCheck() {
			const text = bmwPublicParams.suggest_text;
			if ($('#wcbcf-mailsuggest').length < 1) {
				$('#billing_email').after('<div id="wcbcf-mailsuggest"></div>');
			}

			$('#billing_email').on('blur', function () {
				$('#wcbcf-mailsuggest').html('');
				$(this).mailcheck({
					suggested(element, suggestion) {
						$('#wcbcf-mailsuggest').html(
							text.replace('%hint%', suggestion.full)
						);
					},
				});
			});

			$('#wcbcf-mailsuggest').css({
				color: '#c00',
				fontSize: 'small',
			});
		},

		/**
		 * Look up CNPJ on the server and auto-fill checkout fields.
		 * Uses event delegation so it works even when WooCommerce re-renders
		 * the checkout form or the field is initially hidden.
		 */
		cnpjLookup() {
			$(document.body).on('blur', '#billing_cnpj', function () {
				const rawCnpj = $(this).val();
				const cnpj    = rawCnpj.replace(/\D/g, '');

				// Ensure status element exists right next to the field.
				const $field = $(this).closest('.form-row, p');
				if ($('#wcbcf-cnpj-status').length < 1) {
					$field.after(
						'<p id="wcbcf-cnpj-status" style="margin-top:-10px;margin-bottom:10px;font-size:small;"></p>'
					);
				}

				if (cnpj.length !== 14) {
					$('#wcbcf-cnpj-status').text('');
					return;
				}

				$('#wcbcf-cnpj-status')
					.css('color', '#555')
					.text(bmwPublicParams.cnpj_loading || 'Buscando CNPJ...');

				$.ajax({
					url:    bmwPublicParams.ajax_url,
					type:   'POST',
					data:   {
						action:   'wcbcf_cnpj_lookup',
						security: bmwPublicParams.cnpj_nonce,
						cnpj:     cnpj,
					},
					success: function (response) {
						if (!response || !response.success) {
							$('#wcbcf-cnpj-status')
								.css('color', '#c00')
								.text(
									response && response.data && response.data.message
										? response.data.message
										: (bmwPublicParams.cnpj_error || 'Não foi possível obter dados do CNPJ.')
								);
							return;
						}

						$('#wcbcf-cnpj-status').css('color', 'green').text('✓');

						const d   = response.data;
						const est = d.estabelecimento || {};

						// Razão social → Company.
						if (d.razao_social) {
							$('#billing_company').val(d.razao_social).trigger('change');
						}

						// Nome fantasia → also store in company if razao_social absent.
						if (!d.razao_social && est.nome_fantasia) {
							$('#billing_company').val(est.nome_fantasia).trigger('change');
						}

						// Logradouro → Address line 1.
						if (est.logradouro) {
							const street = est.tipo_logradouro
								? est.tipo_logradouro + ' ' + est.logradouro
								: est.logradouro;
							$('#billing_address_1').val(street).trigger('change');
						}

						// Número → Number.
						if (est.numero) {
							$('#billing_number').val(est.numero).trigger('change');
						}

						// Complemento → Address line 2.
						if (est.complemento) {
							$('#billing_address_2').val(est.complemento).trigger('change');
						}

						// Bairro → Neighborhood.
						if (est.bairro) {
							$('#billing_neighborhood').val(est.bairro).trigger('change');
						}

						// CEP → Postcode.
						if (est.cep) {
							const cepClean = est.cep.replace(/\D/g, '');
							const cepFormatted =
								cepClean.length === 8
									? cepClean.slice(0, 5) + '-' + cepClean.slice(5)
									: cepClean;
							$('#billing_postcode')
								.val(cepFormatted)
								.trigger('change')
								.trigger('keyup');
						}

						// Cidade → City.
						if (est.cidade && est.cidade.nome) {
							$('#billing_city').val(est.cidade.nome).trigger('change');
						}

						// Estado → State.
						if (est.estado && est.estado.sigla) {
							const $state = $('#billing_state');
							$state.val(est.estado.sigla).trigger('change');
							// Refresh select2 if active.
							if ($state.hasClass('select2-hidden-accessible')) {
								$state.trigger('select2:select');
							}
						}

						// Telefone → Phone.
						if (est.ddd1 && est.telefone1) {
							const phoneRaw = est.ddd1 + est.telefone1;
							const phoneFmt =
								phoneRaw.length === 11
									? '(' + phoneRaw.slice(0, 2) + ') ' + phoneRaw.slice(2, 7) + '-' + phoneRaw.slice(7)
									: '(' + phoneRaw.slice(0, 2) + ') ' + phoneRaw.slice(2, 6) + '-' + phoneRaw.slice(6);
							$('#billing_phone').val(phoneFmt).trigger('change');
						}

						// E-mail.
						if (est.email) {
							$('#billing_email').val(est.email).trigger('change');
						}

						// Inscrição Estadual → State Registration.
						if (
							est.inscricoes_estaduais &&
							est.inscricoes_estaduais.length > 0
						) {
							const ie = est.inscricoes_estaduais.find(function (i) {
								return i.ativo;
							}) || est.inscricoes_estaduais[0];

							if (ie && ie.inscricao_estadual) {
								$('#billing_ie').val(ie.inscricao_estadual).trigger('change');
							}
						}
					},
					error: function (xhr) {
						let msg = bmwPublicParams.cnpj_error || 'Erro ao consultar CNPJ.';
						try {
							const json = JSON.parse(xhr.responseText);
							if (json && json.data && json.data.message) {
								msg = json.data.message;
							}
						} catch (e) {}
						$('#wcbcf-cnpj-status').css('color', '#c00').text(msg);
					},
				});
			});
		},
	};

	bmwFrontEnd.init();
});
