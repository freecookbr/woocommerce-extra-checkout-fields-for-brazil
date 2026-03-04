<?php
/**
 * Extra checkout fields main class.
 *
 * @package Extra_Checkout_Fields_For_Brazil
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Plugin main class.
 */
class Extra_Checkout_Fields_For_Brazil {

	/**
	* Plugin version.
	*
	* @var string
	*/
	const VERSION = '4.0.2';

	/**
	 * Instance of this class.
	 *
	 * @var object
	 */
	protected static $instance = null;

	/**
	 * Initialize the plugin.
	 */
	private function __construct() {
		// Load plugin text domain.
		add_action( 'init', array( $this, 'load_plugin_textdomain' ) );

		if ( class_exists( 'WooCommerce' ) ) {
			add_action( 'before_woocommerce_init', array( $this, 'setup_hpos_compatibility' ) );

			if ( is_admin() ) {
				$this->admin_includes();
				// Remove update notifications and auto-update button
				add_filter( 'site_transient_update_plugins', array( $this, 'remove_plugin_updates' ) );
				add_filter( 'transient_update_plugins', array( $this, 'remove_plugin_updates' ) );
				// Remove "Ver detalhes" link from plugin row
				add_filter( 'plugin_row_meta', array( $this, 'remove_plugin_row_meta' ), 10, 2 );
				// Remove "Ativar atualizações automáticas" button
				add_filter( 'plugin_auto_update_setting_html', array( $this, 'remove_auto_update_html' ), 10, 2 );
			}

			$this->includes();
			add_filter( 'plugin_action_links_' . plugin_basename( CSBMW_PLUGIN_FILE ), array( $this, 'plugin_action_links' ) );
		} else {
			add_action( 'admin_notices', array( $this, 'woocommerce_fallback_notice' ) );
		}
	}

	/**
	 * Return an instance of this class.
	 *
	 * @return object A single instance of this class.
	 */
	public static function get_instance() {
		// If the single instance hasn't been set, set it now.
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Get assets url.
	 *
	 * @return string
	 */
	public static function get_assets_url() {
		return plugins_url( 'assets/', CSBMW_PLUGIN_FILE );
	}

	/**
	 * Load the plugin text domain for translation.
	 */
	public function load_plugin_textdomain() {
		// Try to use the plugins own translation, only available for pt_BR.
		$locale = apply_filters( 'plugin_locale', determine_locale(), 'woocommerce-extra-checkout-fields-for-brazil' );

		if ( 'pt_BR' === $locale ) {
			unload_textdomain( 'woocommerce-extra-checkout-fields-for-brazil' );
			load_textdomain(
				'woocommerce-extra-checkout-fields-for-brazil',
				plugin_dir_path( CSBMW_PLUGIN_FILE ) . '/languages/woocommerce-extra-checkout-fields-for-brazil-' . $locale . '.mo'
			);
		}

		// Load regular translation from WordPress.
		load_plugin_textdomain(
			'woocommerce-extra-checkout-fields-for-brazil',
			false,
			dirname( plugin_basename( CSBMW_PLUGIN_FILE ) ) . '/languages'
		);
	}

	/**
	 * Setup WooCommerce HPOS compatibility.
	 */
	public function setup_hpos_compatibility() {
		if ( defined( 'WC_VERSION' ) && version_compare( WC_VERSION, '7.1', '<' ) ) {
			return;
		}

		if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
				'custom_order_tables',
				'woocommerce-extra-checkout-fields-for-brazil/woocommerce-extra-checkout-fields-for-brazil.php',
				true
			);
		}
	}

	/**
	 * Includes.
	 */
	private function includes() {
		include_once dirname( CSBMW_PLUGIN_FILE ) . '/includes/class-extra-checkout-fields-for-brazil-formatting.php';
		include_once dirname( CSBMW_PLUGIN_FILE ) . '/includes/class-extra-checkout-fields-for-brazil-front-end.php';
		include_once dirname( CSBMW_PLUGIN_FILE ) . '/includes/class-extra-checkout-fields-for-brazil-integrations.php';
		include_once dirname( CSBMW_PLUGIN_FILE ) . '/includes/class-extra-checkout-fields-for-brazil-api.php';
	}

	/**
	 * Admin includes.
	 */
	private function admin_includes() {
		include_once dirname( CSBMW_PLUGIN_FILE ) . '/includes/admin/class-extra-checkout-fields-for-brazil-admin.php';
		include_once dirname( CSBMW_PLUGIN_FILE ) . '/includes/admin/class-extra-checkout-fields-for-brazil-settings.php';
		include_once dirname( CSBMW_PLUGIN_FILE ) . '/includes/admin/class-extra-checkout-fields-for-brazil-order.php';
		include_once dirname( CSBMW_PLUGIN_FILE ) . '/includes/admin/class-extra-checkout-fields-for-brazil-customer.php';
	}

	/**
	 * Action links.
	 *
	 * @param  array $links Default plugin links.
	 *
	 * @return array
	 */
	public function plugin_action_links( $links ) {
		$plugin_links   = array();
		$plugin_links[] = '<a href="' . esc_url( admin_url( 'admin.php?page=woocommerce-extra-checkout-fields-for-brazil' ) ) . '">' . __( 'Settings', 'woocommerce-extra-checkout-fields-for-brazil' ) . '</a>';

		// Remove "Ver detalhes" link that WordPress adds automatically
		$filtered_links = array_filter( $links, function( $link ) {
			return strpos( $link, 'plugin-information' ) === false && strpos( $link, 'Ver detalhes' ) === false;
		});

		return array_merge( $plugin_links, $filtered_links );
	}

	/**
	 * Remove plugin updates to prevent WordPress from showing update notifications.
	 *
	 * @param  object $value Update object.
	 *
	 * @return object
	 */
	public function remove_plugin_updates( $value ) {
		if ( isset( $value ) && is_object( $value ) ) {
			unset( $value->response[ plugin_basename( CSBMW_PLUGIN_FILE ) ] );
		}
		return $value;
	}

	/**
	 * Remove "Ver detalhes" link from plugin row meta.
	 *
	 * @param array  $links Row meta links.
	 * @param string $file  Plugin file.
	 *
	 * @return array
	 */
	public function remove_plugin_row_meta( $links, $file ) {
		if ( plugin_basename( CSBMW_PLUGIN_FILE ) === $file ) {
			return array();
		}
		return $links;
	}

	/**
	 * Remove "Ativar atualizações automáticas" button.
	 *
	 * @param string $html   HTML output.
	 * @param string $plugin Plugin file.
	 *
	 * @return string
	 */
	public function remove_auto_update_html( $html, $plugin ) {
		if ( plugin_basename( CSBMW_PLUGIN_FILE ) === $plugin ) {
			return '';
		}
		return $html;
	}

	/**
	 * WooCommerce fallback notice.
	 */
	public function woocommerce_fallback_notice() {
		echo '<div class="error"><p>' . wp_kses(
			sprintf(
				/* translators: %s: woocommerce link */
					__( 'Brazilian Market on WooCommerce depends on %s to work!', 'woocommerce-extra-checkout-fields-for-brazil' ),
					'<a href="http://wordpress.org/plugins/woocommerce/">' . __( 'WooCommerce', 'woocommerce-extra-checkout-fields-for-brazil' ) . '</a>'
			),
			array(
				'a' => array(
					'href' => array(),
				),
			)
		) . '</p></div>';
	}
}


