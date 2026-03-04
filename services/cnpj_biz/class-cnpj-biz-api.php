<?php
/**
 * CNPJ.ws API service.
 *
 * Proxies requests to the public CNPJ.ws API so the browser
 * is never exposed to cross-origin issues.
 *
 * Endpoint used: https://publica.cnpj.ws/cnpj/{cnpj}
 *
 * @package Extra_Checkout_Fields_For_Brazil/Services/CnpjBiz
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class Extra_Checkout_Fields_For_Brazil_Cnpj_Biz_Api
 */
class Extra_Checkout_Fields_For_Brazil_Cnpj_Biz_Api {

	/**
	 * Base URL for the public CNPJ.ws API.
	 *
	 * @var string
	 */
	const API_BASE = 'https://publica.cnpj.ws/cnpj/';

	/**
	 * Cache duration in seconds (1 hour).
	 *
	 * @var int
	 */
	const CACHE_TTL = 3600;

	/**
	 * Register AJAX actions (logged-in and non-logged-in users at checkout).
	 */
	public static function register_ajax_actions() {
		add_action( 'wp_ajax_wcbcf_cnpj_lookup', array( __CLASS__, 'ajax_handler' ) );
		add_action( 'wp_ajax_nopriv_wcbcf_cnpj_lookup', array( __CLASS__, 'ajax_handler' ) );
	}

	/**
	 * Handle the AJAX request.
	 *
	 * Expects POST param `cnpj` (digits only or formatted).
	 *
	 * @return void Outputs JSON and exits.
	 */
	public static function ajax_handler() {
		// Basic nonce check.
		check_ajax_referer( 'wcbcf_cnpj_lookup_nonce', 'security' );

		$raw_cnpj = isset( $_POST['cnpj'] ) ? sanitize_text_field( wp_unslash( $_POST['cnpj'] ) ) : '';
		$cnpj     = preg_replace( '/\D/', '', $raw_cnpj );

		if ( 14 !== strlen( $cnpj ) ) {
			wp_send_json_error(
				array( 'message' => __( 'Invalid CNPJ.', 'woocommerce-extra-checkout-fields-for-brazil' ) )
			);
		}

		$data = self::fetch( $cnpj );

		if ( is_wp_error( $data ) ) {
			wp_send_json_error(
				array( 'message' => $data->get_error_message() )
			);
		}

		wp_send_json_success( $data );
	}

	/**
	 * Fetch CNPJ data from the API (with transient cache).
	 *
	 * @param  string $cnpj Pure numeric CNPJ (14 digits).
	 * @return array|WP_Error Decoded response array or WP_Error on failure.
	 */
	public static function fetch( $cnpj ) {
		$cache_key = 'wcbcf_cnpj_' . $cnpj;
		$cached    = get_transient( $cache_key );

		if ( false !== $cached ) {
			return $cached;
		}

		$url      = self::API_BASE . $cnpj;
		$response = wp_remote_get(
			$url,
			array(
				'timeout'    => 15,
				'user-agent' => 'WooCommerce-ECFB/' . Extra_Checkout_Fields_For_Brazil::VERSION . '; ' . get_bloginfo( 'url' ),
				'headers'    => array(
					'Accept' => 'application/json',
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );

		if ( 200 !== (int) $code ) {
			return new WP_Error(
				'cnpj_biz_api_error',
				/* translators: %d: HTTP status code */
				sprintf( __( 'CNPJ.ws API returned HTTP %d.', 'woocommerce-extra-checkout-fields-for-brazil' ), $code )
			);
		}

		$data = json_decode( $body, true );

		if ( ! is_array( $data ) ) {
			return new WP_Error(
				'cnpj_biz_parse_error',
				__( 'Could not parse CNPJ.ws API response.', 'woocommerce-extra-checkout-fields-for-brazil' )
			);
		}

		set_transient( $cache_key, $data, self::CACHE_TTL );

		return $data;
	}
}


