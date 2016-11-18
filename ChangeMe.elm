module ChangeMe exposing (..)

import Html.App exposing (program)
import Material exposing (Model)
import Html exposing (..)
import Material.Button as Button


type MaterialMsg
    = Mdl (Material.Msg MaterialMsg)


materialUpdate : MaterialMsg -> Model -> Model
materialUpdate msg materialModel =
    case msg of
        Mdl msg' ->
            Material.update msg' { mdl = materialModel }
                |> fst
                |> .mdl


main : Program Never
main =
    Html.App.beginnerProgram
        { model = Material.model
        , update = materialUpdate
        , view = view
        }


view : Model -> Html MaterialMsg
view mdl =
    Button.render Mdl
        [ 0 ]
        mdl
        [ Button.raised
        , Button.ripple
        ]
        [ text "a test Button with a long label" ]
