<?php

/**
 * Note Reply - a MantisBT plugin that adds a reply button to issues
 *
 * You should have received a copy of the GNU General Public License
 * along with Note Reply.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @copyright Copyright (C) 2020 Intra2net AG - www.intra2net.com
 */

/**
 * Mantis Note Reply plugin
 */
class NoteReplyPlugin extends MantisPlugin {

    /**
     * A method that populates the plugin information and minimum requirements.
     * @return void
     */
    public function register() {
        $this->name = plugin_lang_get("title");
        $this->description = plugin_lang_get("description");
        $this->page = "";

        $this->version = "1.0.0";
        $this->requires = array(
            "MantisCore" => "2.1.0",
        );

        $this->author = "Intra2net AG";
        $this->contact = "opensource@intra2net.com";
        $this->url = "https://github.com/intra2net/mantisbt-note-reply";
    }

    /**
     * Plugin initialization
     * @return void
     */
    function init() {
        require_api( "access_api.php" );
        require_api( "bug_api.php" );
        require_api( "lang_api.php" );
    }

    /**
     * plugin hooks
     * @return array
     */
    public function hooks() {
        return array(
            "EVENT_LAYOUT_RESOURCES" => "inject_script",
            "EVENT_VIEW_BUG_DETAILS" => "add_guide_label"
        );
    }

    /**
     * Include the javscript file for this plugin
     * @return void
     */
    public function inject_script( ) {
        printf( "\t<script src=\"%s\"></script>\n", plugin_file( "add_reply_button.js" ) );
    }

    /**
     * Write to the bug view page the element we will use as a guide in the javascript file
     * @return void
     */
    public function add_guide_label( $p_event_name, $p_bug_id ) {
        // Only add the label if the user can actually insert notes
        if( ( bug_is_readonly( $p_bug_id ) ) || ( !access_has_bug_level( config_get( "add_bugnote_threshold" ), $p_bug_id ) ) ) {
            return;
        }
        $button_title = plugin_lang_get("button_title");
        // Use a hidden element to access the localized button label
        // and also as a guide to locate the buttons after the issue description
        ?>
            <tr class="hidden">
                <td colspan="6">
                    <span id="notereply-btn-reply"><?php echo $button_title ?></span>
                </td>
            </tr>
        <?php
    }
}