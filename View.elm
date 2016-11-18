module View exposing (view)

import MaterialModel exposing (MaterialModel)
import Html exposing (Html, text)
import MaterialMsg exposing (MaterialMsg(Mdl))
import Msg exposing (Msg(..))
import Material.Button as Button


view : MaterialModel -> Html MaterialMsg
view mdl =
    Button.render Mdl
        [ 0 ]
        mdl.mdl
        [ Button.raised
        , Button.ripple
        ]
        [ text "test Button" ]
